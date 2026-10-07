'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase';
import { loginAdmin, logoutAdmin, requireAdmin } from '@/lib/auth';
import { zonedToUtc, localInputToUtc, fmtDay, fmtTime } from '@/lib/time';
import { cancelAndRefund } from '@/lib/bookings';
import { sendEmail } from '@/lib/email';

export async function login(formData) {
  const ok = await loginAdmin(String(formData.get('password') || ''));
  redirect(ok ? '/admin' : '/admin/login?error=1');
}
export async function logout() { await logoutAdmin(); redirect('/admin/login'); }

const int = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };

export async function saveSlot(formData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const sb = db();
  const { data: old } = await sb.from('slots').select('*').eq('id', id).single();
  const patch = {
    starts_at: localInputToUtc(String(formData.get('starts'))).toISOString(),
    ends_at: localInputToUtc(String(formData.get('ends'))).toISOString(),
    title: String(formData.get('title') || '').trim() || null,
    audience: String(formData.get('audience') || 'open'),
    is_private: formData.get('is_private') === 'on',
    capacity: int(formData.get('capacity'), 7),
    price_member: int(formData.get('price_member'), 3000),
    price_nonmember: int(formData.get('price_nonmember'), 4000),
    notes: String(formData.get('notes') || '').trim() || null,
    is_published: formData.get('is_published') === 'on',
  };
  await sb.from('slots').update(patch).eq('id', id);

  // If the time moved, tell everyone who has booked and let them cancel for a full refund.
  if (new Date(old.starts_at).getTime() !== new Date(patch.starts_at).getTime()) {
    const { data: paid } = await sb.from('bookings').select('*').eq('slot_id', id).eq('status', 'paid');
    for (const b of paid || []) {
      await sb.from('bookings').update({ refund_override: true }).eq('id', b.id);
      await sendEmail({
        to: b.email,
        subject: 'Your Pelikan Szauna session has moved',
        text: `Your session has moved to ${fmtDay(patch.starts_at)}, ${fmtTime(patch.starts_at)}-${fmtTime(patch.ends_at)}.\n` +
          `If the new time does not work, you can cancel for a full refund at ${process.env.SITE_URL}/cancel/${b.cancel_token}`,
      });
    }
  }
  revalidatePath('/');
  redirect(`/admin/slots/${id}?saved=1`);
}

export async function deleteSlot(formData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const sb = db();
  const { count } = await sb.from('bookings').select('id', { count: 'exact', head: true })
    .eq('slot_id', id).in('status', ['paid', 'pending']);
  if (count > 0) redirect(`/admin/slots/${id}?error=${encodeURIComponent('This session has bookings. Cancel them first, or untick Published.')}`);
  await sb.from('bookings').delete().eq('slot_id', id);
  await sb.from('slots').delete().eq('id', id);
  revalidatePath('/');
  redirect('/admin');
}

export async function generateSlots(formData) {
  await requireAdmin();
  const from = String(formData.get('from')); const to = String(formData.get('to'));
  const days = formData.getAll('day').map(Number);
  const times = String(formData.get('times')).split(/[,\s]+/).filter((t) => /^\d{1,2}:\d{2}$/.test(t));
  const duration = int(formData.get('duration'), 90);
  const base = {
    title: String(formData.get('title') || '').trim() || null,
    audience: String(formData.get('audience') || 'open'),
    capacity: int(formData.get('capacity'), 7),
    price_member: int(formData.get('price_member'), 3000),
    price_nonmember: int(formData.get('price_nonmember'), 4000),
  };
  const sb = db();
  const { data: existing } = await sb.from('slots').select('starts_at');
  const have = new Set((existing || []).map((s) => new Date(s.starts_at).getTime()));

  const rows = [];
  const cur = new Date(from + 'T12:00:00Z'); const end = new Date(to + 'T12:00:00Z');
  while (cur <= end) {
    if (days.includes(cur.getUTCDay())) {
      const ds = cur.toISOString().slice(0, 10);
      for (const t of times) {
        const start = zonedToUtc(ds, t.padStart(5, '0'));
        if (have.has(start.getTime())) continue;
        rows.push({ ...base, starts_at: start.toISOString(), ends_at: new Date(start.getTime() + duration * 60000).toISOString() });
      }
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  if (rows.length) await sb.from('slots').insert(rows);
  revalidatePath('/');
  redirect(`/admin?created=${rows.length}`);
}

export async function adminCancel(formData) {
  await requireAdmin();
  const r = await cancelAndRefund(String(formData.get('booking_id')));
  const slot = String(formData.get('slot_id'));
  redirect(`/admin/slots/${slot}` + (r.ok ? '?saved=1' : `?error=${encodeURIComponent(r.error)}`));
}

export async function addManualBooking(formData) {
  await requireAdmin();
  const slot = String(formData.get('slot_id'));
  const sb = db();
  const { data: b, error } = await sb.rpc('reserve_booking', {
    p_slot: slot,
    p_email: String(formData.get('email') || '').trim().toLowerCase(),
    p_name: String(formData.get('name') || '').trim(),
    p_qty: int(formData.get('qty'), 1),
  });
  if (error) redirect(`/admin/slots/${slot}?error=${encodeURIComponent(error.message)}`);
  await sb.from('bookings').update({
    status: 'paid', payment_method: 'manual', paid_at: new Date().toISOString(), hold_expires_at: null,
  }).eq('id', b.id);
  redirect(`/admin/slots/${slot}?saved=1`);
}

export async function setMemberStatus(formData) {
  await requireAdmin();
  const id = String(formData.get('id')); const status = String(formData.get('status'));
  const patch = { status };
  if (status === 'active') {
    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
    patch.joined_at = new Date().toISOString(); patch.expires_at = exp.toISOString();
  }
  await db().from('members').update(patch).eq('id', id);
  redirect('/admin/members');
}

export async function addMember(formData) {
  await requireAdmin();
  const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
  await db().from('members').upsert({
    email: String(formData.get('email') || '').trim().toLowerCase(),
    name: String(formData.get('name') || '').trim(),
    status: 'active', joined_at: new Date().toISOString(), expires_at: exp.toISOString(),
  }, { onConflict: 'email' });
  redirect('/admin/members');
}
