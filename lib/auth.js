import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'pelikan_admin';
const sig = () =>
  crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || 'dev').update('pelikan-admin').digest('hex');

function safeEqual(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function loginAdmin(password) {
  if (password && process.env.ADMIN_PASSWORD && safeEqual(password, process.env.ADMIN_PASSWORD)) {
    (await cookies()).set(COOKIE, sig(), {
      httpOnly: true, sameSite: 'lax', path: '/',
      secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 14,
    });
    return true;
  }
  return false;
}
export async function logoutAdmin() { (await cookies()).delete(COOKIE); }
export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  return !!v && safeEqual(v, sig());
}
export async function requireAdmin() { if (!(await isAdmin())) redirect('/admin/login'); }
