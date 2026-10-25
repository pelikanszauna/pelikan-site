import { NextResponse } from 'next/server';

// Offline switch. In Vercel > Settings > Environment Variables set:
//   MAINTENANCE_MODE = true      -> every visitor sees the "Back soon" page (with the form button)
//   MAINTENANCE_MODE = redirect  -> every visitor is sent straight to the form
//   (delete the variable, or set it to false) -> the site is open again.
// Redeploy after changing it. /admin and the Stripe webhook keep working while offline.
const FORM_URL = 'https://form.everestwebdeals.co/?form=1fd03dc415923b77fd474f064274b8a2';
const ALWAYS_OPEN = ['/admin', '/api/stripe/webhook', '/api/export', '/offline'];

export function middleware(req) {
  const mode = (process.env.MAINTENANCE_MODE || '').toLowerCase();
  if (!mode || mode === 'false' || mode === '0') return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (ALWAYS_OPEN.some((p) => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next();

  if (mode === 'redirect') return NextResponse.redirect(FORM_URL);
  return NextResponse.rewrite(new URL('/offline', req.url), { status: 503 });
}

export const config = { matcher: ['/((?!_next/|fonts/|gallery/|favicon.ico).*)'] };
