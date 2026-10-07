import { db } from '@/lib/supabase';
import { dayKey, fmtDay } from '@/lib/time';
import SlotRow from '@/components/SlotRow';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sessions · Pelikan Szauna' };

export default async function Sessions() {
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
        <h1>Sessions</h1>
        <p>Pick a time. Members pay less, and you can cancel for a full refund up to 24 hours before.</p>
      </section>
      {error && <p className="notice err">Sessions could not be loaded. Please try again shortly.</p>}
      {!error && days.length === 0 && <p className="notice">No sessions are open for booking yet. Check back soon.</p>}
      {days.map((d) => (
        <section className="day" key={d.k}>
          <h2>{d.label}</h2>
          {d.slots.map((s) => <SlotRow key={s.id} s={s} />)}
        </section>
      ))}
    </>
  );
}
