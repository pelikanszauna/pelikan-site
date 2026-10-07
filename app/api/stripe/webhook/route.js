import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';
import { fmtDay, fmtTime } from '@/lib/time';
import { huf } from '@/lib/format';

export const runtime = 'nodejs';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  const sb = db();
  const session = event.data.object;
  const bookingId = session?.metadata?.booking_id;

  if (event.type === 'checkout.session.completed' && bookingId && session.payment_status === 'paid') {
    const { data: b } = await sb.from('bookings')
      .update({
        status: 'paid', paid_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent, stripe_session_id: session.id,
      })
      .eq('id', bookingId).in('status', ['pending', 'expired'])
      .select('*, slots(*)').maybeSingle();
    if (b) {
      // TODO: issue a számla here (Számlázz.hu / Billingo API) and store b.invoice_number.
      await sendEmail({
        to: b.email,
        subject: 'Your Pelikan Szauna booking',
        text: `You're booked: ${fmtDay(b.slots.starts_at)}, ${fmtTime(b.slots.starts_at)}-${fmtTime(b.slots.ends_at)}.\n` +
          `${b.quantity} place(s), paid ${huf(b.total_price)}.\n\n` +
          `Cancel for a full refund up to 24 hours before: ${process.env.SITE_URL}/cancel/${b.cancel_token}`,
      });
    }
  }

  if (event.type === 'checkout.session.expired' && bookingId) {
    await sb.from('bookings').update({ status: 'expired' }).eq('id', bookingId).eq('status', 'pending');
  }
  return NextResponse.json({ received: true });
}
