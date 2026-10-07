import Link from 'next/link';
import { db } from '@/lib/supabase';
import { dayKey, fmtDay } from '@/lib/time';
import SlotRow from '@/components/SlotRow';
import { copy } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const c = copy.en.home;
  const { data: slots } = await db()
    .from('slot_availability').select('*')
    .eq('is_published', true).gt('starts_at', new Date().toISOString()).order('starts_at').limit(4);

  return (
    <>
      <section className="hero">
        <h1>{c.headline}</h1>
        <p>{c.sub}</p>
        <div className="row">
          <Link className="btn" href="/sessions">Book a session</Link>
          <Link className="btn ghost" href="/membership">Become a member</Link>
        </div>
      </section>

      {slots && slots.length > 0 && (
        <section className="section">
          <h2>Next sessions</h2>
          {slots.map((s) => (
            <div key={s.id}>
              <div className="hint" style={{ marginTop: 14 }}>{fmtDay(s.starts_at)}</div>
              <SlotRow s={s} />
            </div>
          ))}
          <p style={{ marginTop: 18 }}><Link href="/sessions">See all sessions</Link></p>
        </section>
      )}

      <section className="section">
        <h2>How it works</h2>
        <div className="steps">
          {c.steps.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <section className="strip">
        <h2>{c.member.title}</h2>
        <p>{c.member.text}</p>
        <Link className="btn" href="/membership">Request membership</Link>
      </section>
    </>
  );
}
