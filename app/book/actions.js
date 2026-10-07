'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { fmtDay, fmtTime } from '@/lib/time';

export async function startCheckout(formData) {
  const slotId = String(formData.get('slot_id') || '');
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const qty = parseInt(formData.get('qty') || '1', 10) || 1;
  const back = (m) => redirect(`/book/${slotId}?error=${encodeURIComponent(m)}`);

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) back('Enter your name and a valid email address.');
  if (!formData.get('agree')) back('Please accept the cancellation policy to continue.');

  const sb = db();
  const { data: booking, error } = await sb.rpc('reserve_booking', {
    p_slot: slotId, p_email: email, p_name: name, p_qty: qty,
  });
  if (error) back(error.message);

  const { data: slot } = await sb.from('slots').select('*').eq('id', slotId).single();
  const site = process.env.SITE_URL;

  let session;
  try {
    session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      locale: 'auto',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'huf',
          // Stripe takes HUF amounts multiplied by 100 (must end in 00).
          unit_amount: booking.total_price * 100,
          product_data: {
            name: `Pelikan Szauna, ${fmtDay(slot.starts_at)} ${fmtTime(slot.starts_at)}`,
            description: `${booking.quantity} ${booking.quantity === 1 ? 'place' : 'places'}${booking.is_member_rate ? ' (member rate)' : ''}`,
          },
        },
      }],
      metadata: { booking_id: booking.id },
      payment_intent_data: { metadata: { booking_id: booking.id } },
      success_url: `${site}/booking/success?t=${booking.cancel_token}`,
      cancel_url: `${site}/booking/abandoned?t=${booking.cancel_token}`,
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    });
  } catch (e) {
    console.error('stripe session failed', e);
    await sb.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', booking.id);
    back('Payment could not be started. Please try again.');
  }

  await sb.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);
  redirect(session.url);
}
