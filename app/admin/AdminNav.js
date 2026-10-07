import Link from 'next/link';
import { logout } from './actions';
export default function AdminNav() {
  return (
    <div className="admin-nav">
      <Link href="/admin">Sessions</Link>
      <Link href="/admin/generate">Create sessions</Link>
      <Link href="/admin/bookings">Bookings</Link>
      <Link href="/admin/members">Members</Link>
      <form action={logout} className="inline"><button className="ghost" type="submit">Sign out</button></form>
    </div>
  );
}
