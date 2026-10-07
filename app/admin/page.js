import Link from 'next/link';
import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { dayKey, fmtDay, fmtTime } from '@/lib/time';
import { huf } from '@/lib/format';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';

export default async function Admin({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: slots, error } = await db().from('slot_availability').select('*').gt('ends_at', since).order('starts_at');
  return (
    <div className="wide">
      <AdminNav />
      {sp?.created && <p className="notice">{sp.created} new sessions created.</p>}
      {error && <p className="notice err" role="alert">Database problem: {error.message}. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, and that schema.sql ran.</p>}
      {!error && <p className="hint">{(slots || []).length} sessions in the database from yesterday onwards.</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Places</th><th>Price</th><th>Public</th><th></th></tr></thead>
          <tbody>
            {(slots || []).map((s) => (
              <tr key={s.id}>
                <td>{fmtDay(s.starts_at)}</td>
                <td>{fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}</td>
                <td>{s.is_private ? 'Private' : s.audience}{s.title ? `: ${s.title}` : ''}</td>
                <td>{s.taken}/{s.capacity}</td>
                <td>{s.is_private ? huf(s.price_nonmember) : `${huf(s.price_member)} / ${huf(s.price_nonmember)}`}</td>
                <td>{s.is_published ? 'yes' : 'hidden'}</td>
                <td><Link href={`/admin/slots/${s.id}`}>Edit and roster</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
