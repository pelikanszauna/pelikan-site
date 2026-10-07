import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase';
import { fmtDay, fmtTime } from '@/lib/time';
import { huf, audienceLabel } from '@/lib/format';
import { startCheckout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Book({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const { data: s } = await db().from('slot_availability').select('*').eq('id', id).maybeSingle();
  if (!s || !s.is_published) notFound();
  const left = s.capacity - s.taken;
  const past = new Date(s.starts_at) <= new Date();
  const maxQty = Math.max(1, Math.min(left, 6));

  return (
    <>
      <section className="hero">
        <h1>{fmtDay(s.starts_at)}, {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}</h1>
        <p>
          {s.title && <>{s.title}. </>}
          {s.is_private ? 'Private session for your group.' : audienceLabel[s.audience] ? `${audienceLabel[s.audience]}. ` : ''}
          {s.notes}
        </p>
      </section>

      {sp?.error && <p className="notice err" role="alert">{sp.error}</p>}

      {past || left <= 0 ? (
        <p className="notice">This session is {past ? 'no longer open' : s.is_private ? 'already booked' : 'full'}. <a href="/">See other sessions</a>.</p>
      ) : (
        <form action={startCheckout} className="stack">
          <input type="hidden" name="slot_id" value={s.id} />
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email
            <input name="email" type="email" required autoComplete="email" />
            <span className="hint">Use the email you joined with and your member price applies automatically.</span>
          </label>
          {!s.is_private && (
            <label>Places
              <select name="qty" defaultValue="1">
                {Array.from({ length: maxQty }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="hint">Members {huf(s.price_member)}, everyone else {huf(s.price_nonmember)}. Guests you bring pay {huf(s.price_nonmember)}.</span>
            </label>
          )}
          {s.is_private && <p className="notice">Private booking, {huf(s.price_nonmember)} for the whole sauna.</p>}
          <label className="check">
            <input type="checkbox" name="agree" required />
            <span>I understand I can cancel for a full refund up to 24 hours before the session, and not after.</span>
          </label>
          <button type="submit">Continue to payment</button>
        </form>
      )}
    </>
  );
}
