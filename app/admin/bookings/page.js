import Link from 'next/link';
import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { fmtDay, fmtTime, fmtStamp } from '@/lib/time';
import { huf } from '@/lib/format';
import AdminNav from '../AdminNav';

export const dynamic = 'force-dynamic';

export default async function Bookings() {
  await requireAdmin();
  const { data } = await db().from('bookings').select('*, slots(*)').neq('status', 'pending')
    .order('created_at', { ascending: false }).limit(300);
  const paid = (data || []).filter((b) => b.status === 'paid');
  const total = paid.reduce((n, b) => n + b.total_price, 0);
  return (
    <div className="wide">
      <AdminNav />
      <h1>Bookings</h1>
      <p className="hint">{paid.length} paid bookings shown, {huf(total)} in total (latest 300).</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Booked</th><th>Session</th><th>Name</th><th>Email</th><th>Places</th><th>Amount</th><th>Status</th><th>Invoice</th></tr></thead>
          <tbody>
            {(data || []).map((b) => (
              <tr key={b.id}>
                <td>{fmtStamp(b.created_at)}</td>
                <td><Link href={`/admin/slots/${b.slot_id}`}>{fmtDay(b.slots.starts_at)} {fmtTime(b.slots.starts_at)}</Link></td>
                <td>{b.name}</td><td>{b.email}</td><td>{b.quantity}</td>
                <td>{huf(b.total_price)}</td><td>{b.status}</td><td>{b.invoice_number || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
