import { db } from '@/lib/supabase';
import { fmtDay, fmtTime } from '@/lib/time';
import { huf } from '@/lib/format';
import { canSelfCancel } from '@/lib/bookings';
import { cancelBooking } from './actions';

export const dynamic = 'force-dynamic';

export default async function Cancel({ params, searchParams }) {
  const { token } = await params;
  const sp = await searchParams;
  const { data: b } = await db().from('bookings').select('*, slots(*)').eq('cancel_token', token).maybeSingle();
  if (!b) return <section className="hero"><h1>Booking not found</h1></section>;

  const ok = canSelfCancel(b, b.slots);
  return (
    <section className="hero">
      <h1>Your booking</h1>
      <div className="card">
        <p><strong>{fmtDay(b.slots.starts_at)}, {fmtTime(b.slots.starts_at)}–{fmtTime(b.slots.ends_at)}</strong></p>
        <p>{b.quantity} {b.quantity === 1 ? 'place' : 'places'} for {b.name}. {huf(b.total_price)}. Status: {b.status}.</p>
      </div>
      {sp?.done && <p className="notice">Cancelled. If you paid by card, the refund is on its way.</p>}
      {sp?.error && <p className="notice err" role="alert">{sp.error}</p>}
      {b.status === 'paid' && ok && (
        <form action={cancelBooking}>
          <input type="hidden" name="token" value={token} />
          <button className="danger" type="submit">Cancel and refund</button>
        </form>
      )}
      {b.status === 'paid' && !ok && (
        <p className="notice">Cancellation closed 24 hours before the session. Write to us if something has come up.</p>
      )}
    </section>
  );
}
