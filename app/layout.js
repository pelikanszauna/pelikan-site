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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Source+Sans+3:wght@400;600&display=swap"
        />
      </head>
      <body>
        <header className="top">
          <Link href="/" className="mark">Pelikan Szauna</Link>
          <nav aria-label="Main">
            <Link href="/">Sessions</Link>
            <Link href="/membership">Membership</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>Pelikan Szauna Egyesület, Budapest. Reconnecting Budapest through sauna.</p>
          <p><a href="https://instagram.com/pelikanszauna">Instagram</a></p>
        </footer>
      </body>
    </html>
  );
}
