import { db } from '@/lib/supabase';
import { fmtDay, fmtTime } from '@/lib/time';
import { huf } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Success({ searchParams }) {
  const { t } = await searchParams;
  const { data: b } = await db().from('bookings').select('*, slots(*)').eq('cancel_token', t || '').maybeSingle();
  if (!b) return <section className="hero"><h1>Booking not found</h1><p><a href="/">Back to sessions</a></p></section>;

  if (b.status === 'pending') {
    return (
      <section className="hero">
        <meta httpEquiv="refresh" content="4" />
        <h1>Confirming your payment…</h1>
        <p>This page updates by itself. It usually takes a few seconds.</p>
      </section>
    );
  }
  if (b.status !== 'paid') {
    return <section className="hero"><h1>This booking is {b.status}</h1><p><a href="/">Back to sessions</a></p></section>;
  }
  return (
    <section className="hero">
      <h1>You&apos;re booked.</h1>
      <div className="card">
        <p><strong>{fmtDay(b.slots.starts_at)}, {fmtTime(b.slots.starts_at)}–{fmtTime(b.slots.ends_at)}</strong></p>
        <p>{b.quantity} {b.quantity === 1 ? 'place' : 'places'} for {b.name}. Paid {huf(b.total_price)}.</p>
      </div>
      <p>We emailed a confirmation to {b.email}. You can cancel for a full refund up to 24 hours before at <a href={`/cancel/${b.cancel_token}`}>this link</a>.</p>
    </section>
  );
}
