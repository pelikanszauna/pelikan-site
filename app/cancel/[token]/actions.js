'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { canSelfCancel, cancelAndRefund } from '@/lib/bookings';

export async function cancelBooking(formData) {
  const token = String(formData.get('token') || '');
  const { data: b } = await db().from('bookings').select('*, slots(*)').eq('cancel_token', token).maybeSingle();
  if (!b) redirect('/');
  if (!canSelfCancel(b, b.slots)) redirect(`/cancel/${token}?error=${encodeURIComponent('Cancellation is closed for this session.')}`);
  const r = await cancelAndRefund(b.id);
  if (!r.ok) redirect(`/cancel/${token}?error=${encodeURIComponent(r.error)}`);
  redirect(`/cancel/${token}?done=1`);
}
