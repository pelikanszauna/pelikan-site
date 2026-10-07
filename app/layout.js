import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Pelikan Szauna',
  description: 'Community sauna in Budapest. Book a session.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap"
        />
      </head>
      <body>
        <div className="stripe" aria-hidden="true" />
        <header className="top">
          <Link href="/" className="mark">Pelikan Szauna</Link>
          <nav aria-label="Main">
            <Link href="/">Home</Link>
            <Link href="/sessions">Sessions</Link>
            <Link href="/about">About</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/membership">Membership</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>Pelikan Szauna Egyesület, Budapest. Community sauna in Budapest.</p>
          <p><a href="https://instagram.com/pelikanszauna">Instagram</a></p>
        </footer>
      </body>
    </html>
  );
}
