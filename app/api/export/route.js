import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { toCsv } from '@/lib/csv';
import { dayKey, fmtTime } from '@/lib/time';

export const dynamic = 'force-dynamic';

// GET /api/export?kind=finance|bookings|members|slots&format=csv|json
// Send the token in the x-export-token header (preferred) or ?token=
export async function GET(req) {
  const url = new URL(req.url);
  const token = req.headers.get('x-export-token') || url.searchParams.get('token') || '';
  const kind = url.searchParams.get('kind') || 'finance';
  const format = url.searchParams.get('format') || 'csv';

  const full = !!process.env.EXPORT_TOKEN_FULL && token === process.env.EXPORT_TOKEN_FULL;
  const fin = !!process.env.EXPORT_TOKEN_FINANCE && token === process.env.EXPORT_TOKEN_FINANCE;
  const allowed = kind === 'finance' || kind === 'slots' ? fin || full : full;
  if (!allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = db();
  let rows = [];

  if (kind === 'finance' || kind === 'bookings') {
    const { data } = await sb.from('bookings').select('*, slots(*)').neq('status', 'pending').order('created_at');
    rows = (data || []).map((b) => {
      const base = {
        booking_id: b.id,
        session_date: dayKey(b.slots.starts_at),
        session_start: fmtTime(b.slots.starts_at),
        session_title: b.slots.title || '',
        audience: b.slots.is_private ? 'private' : b.slots.audience,
        places: b.quantity,
        member_rate: b.is_member_rate ? 'yes' : 'no',
        total_huf: b.total_price,
        status: b.status,
        payment_method: b.payment_method,
        invoice_number: b.invoice_number || '',
        paid_at: b.paid_at || '',
      };
      return kind === 'bookings' ? { ...base, name: b.name, email: b.email } : base;
    });
  } else if (kind === 'slots') {
    const { data } = await sb.from('slot_availability').select('*').order('starts_at');
    rows = (data || []).map((s) => ({
      slot_id: s.id, date: dayKey(s.starts_at), start: fmtTime(s.starts_at), end: fmtTime(s.ends_at),
      title: s.title || '', audience: s.is_private ? 'private' : s.audience, capacity: s.capacity,
      places_taken: s.taken, price_member: s.price_member, price_nonmember: s.price_nonmember,
      published: s.is_published ? 'yes' : 'no',
    }));
  } else if (kind === 'members') {
    const { data } = await sb.from('members').select('*').order('created_at');
    rows = (data || []).map((m) => ({
      name: m.name || '', email: m.email, status: m.status,
      joined_at: m.joined_at || '', expires_at: m.expires_at || '',
    }));
  } else {
    return NextResponse.json({ error: 'Unknown kind' }, { status: 400 });
  }

  if (format === 'json') return NextResponse.json(rows);
  return new NextResponse(toCsv(rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
