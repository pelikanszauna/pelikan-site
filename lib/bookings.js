import { db } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';
import { fmtDay, fmtTime } from '@/lib/time';

export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canSelfCancel(booking, slot) {
  if (booking.status !== 'paid') return false;
  if (booking.refund_override) return new Date(slot.starts_at) > new Date();
  return new Date(slot.starts_at).getTime() - Date.now() >= CANCEL_WINDOW_MS;
}

// Cancels a paid booking and refunds it (Stripe bookings are refunded in full).
export async function cancelAndRefund(bookingId) {
  const sb = db();
  const { data: b } = await sb.from('bookings').select('*, slots(*)').eq('id', bookingId).single();
  if (!b || b.status !== 'paid') return { ok: false, error: 'This booking is not active.' };
  let status = 'cancelled';
  if (b.payment_method === 'stripe' && b.stripe_payment_intent) {
    try {
      await stripe().refunds.create({ payment_intent: b.stripe_payment_intent });
      status = 'refunded';
    } catch (e) {
      return { ok: false, error: 'The refund failed: ' + (e.message || 'unknown error') };
    }
  }
  await sb.from('bookings').update({ status, cancelled_at: new Date().toISOString() }).eq('id', b.id);
  await sendEmail({
    to: b.email,
    subject: 'Your Pelikan Szauna booking is cancelled',
    text: `Your booking for ${fmtDay(b.slots.starts_at)} at ${fmtTime(b.slots.starts_at)} has been cancelled.` +
      (status === 'refunded' ? ' The full amount is being refunded to your card (it can take a few days to appear).' : ''),
  });
  return { ok: true, status };
}
