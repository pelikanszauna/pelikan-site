import Link from 'next/link';
import { db } from '@/lib/supabase';
import { dayKey, fmtDay, fmtTime } from '@/lib/time';
import { huf, audienceLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

function Pips({ capacity, taken }) {
  return (
    <div className="pips" role="img" aria-label={`${taken} of ${capacity} places taken`}>
      {Array.from({ length: capacity }, (_, i) => <span key={i} className={i < taken ? 'on' : ''} />)}
    </div>
  );
}

export default async function Home() {
  const { data: slots, error } = await db()
    .from('slot_availability').select('*')
    .eq('is_published', true).gt('starts_at', new Date().toISOString()).order('starts_at');

  const days = [];
  for (const s of slots || []) {
    const k = dayKey(s.starts_at);
    let d = days.find((x) => x.k === k);
    if (!d) { d = { k, label: fmtDay(s.starts_at), slots: [] }; days.push(d); }
    d.slots.push(s);
  }

  return (
    <>
      <section className="hero">
        <h1>Wood-fired sauna by the river. Pick a session.</h1>
        <p>Sessions last 90 minutes. Members pay less, and you can cancel for a full refund up to 24 hours before.</p>
      </section>

      {error && <p className="notice err">Sessions could not be loaded. Please try again shortly.</p>}
      {!error && days.length === 0 && <p className="notice">No sessions are open for booking yet. Check back soon.</p>}

      {days.map((d) => (
        <section className="day" key={d.k}>
          <h2>{d.label}</h2>
          {d.slots.map((s) => {
            const left = s.capacity - s.taken;
            const full = left <= 0;
            return (
              <div className="slot" key={s.id}>
                <div className="time">{fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}</div>
                <div className="meta">
                  {s.is_private && <span className="tag private">Private</span>}
                  {!s.is_private && s.audience !== 'open' && <span className={`tag ${s.audience}`}>{audienceLabel[s.audience]}</span>}
                  {s.title && <strong>{s.title}. </strong>}
                  {s.is_private
                    ? <>Whole sauna, up to {s.capacity} people, {huf(s.price_nonmember)}</>
                    : <>{huf(s.price_member)} members, {huf(s.price_nonmember)} everyone else</>}
                  {s.notes && <div>{s.notes}</div>}
                </div>
                <div className="act">
                  {!s.is_private && <Pips capacity={s.capacity} taken={s.taken} />}
                  <div className="left">
                    {full ? <span className="full">{s.is_private ? 'Booked' : 'Full'}</span>
                      : s.is_private ? 'Available' : `${left} of ${s.capacity} places left`}
                  </div>
                  <Link className="btn" href={`/book/${s.id}`} aria-disabled={full}>
                    {full ? 'Unavailable' : 'Book'}
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
