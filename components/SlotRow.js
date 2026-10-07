import Link from 'next/link';
import { fmtTime } from '@/lib/time';
import { huf, audienceLabel } from '@/lib/format';

export function Pips({ capacity, taken }) {
  return (
    <div className="pips" role="img" aria-label={`${taken} of ${capacity} places taken`}>
      {Array.from({ length: capacity }, (_, i) => <span key={i} className={i < taken ? 'on' : ''} />)}
    </div>
  );
}

export default function SlotRow({ s }) {
  const left = s.capacity - s.taken;
  const full = left <= 0;
  return (
    <div className="slot">
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
        <Link className="btn" href={`/book/${s.id}`} aria-disabled={full}>{full ? 'Unavailable' : 'Book'}</Link>
      </div>
    </div>
  );
}
