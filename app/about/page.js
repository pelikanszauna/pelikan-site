import { copy } from '@/lib/content';
export const metadata = { title: 'About · Pelikan Szauna' };

export default function About() {
  const c = copy.en.about;
  return (
    <>
      <section className="hero"><h1>{c.title}</h1></section>
      <div className="prose">{c.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
    </>
  );
}
