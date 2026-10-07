import { copy } from '@/lib/content';
export const metadata = { title: 'Gallery · Pelikan Szauna' };

export default function Gallery() {
  const c = copy.en.gallery;
  return (
    <>
      <section className="hero"><h1>{c.title}</h1></section>
      {c.images.length === 0 ? <p className="notice">{c.empty}</p> : (
        <div className="gallery">
          {c.images.map((im) => (
            <figure key={im.src}>
              <img src={im.src} alt={im.alt} loading="lazy" />
              {im.caption && <figcaption>{im.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
