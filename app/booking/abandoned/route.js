import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function GET(req) {
  const t = new URL(req.url).searchParams.get('t');
  const sb = db();
  const { data: b } = await sb.from('bookings').select('*').eq('cancel_token', t || '').maybeSingle();
  const origin = process.env.SITE_URL || new URL(req.url).origin;
  if (!b) return NextResponse.redirect(`${origin}/`);
  if (b.status === 'pending') {
    if (b.stripe_session_id) { try { await stripe().checkout.sessions.expire(b.stripe_session_id); } catch {} }
    await sb.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', b.id);
  }
  return NextResponse.redirect(`${origin}/book/${b.slot_id}?error=${encodeURIComponent('Payment cancelled. Your places have been released.')}`);
}
