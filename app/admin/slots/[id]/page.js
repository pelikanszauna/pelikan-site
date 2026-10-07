import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { fmtDay, fmtTime, toLocalInput, fmtStamp } from '@/lib/time';
import { huf } from '@/lib/format';
import AdminNav from '../../AdminNav';
import { saveSlot, deleteSlot, adminCancel, addManualBooking } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function EditSlot({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const sb = db();
  const { data: s } = await sb.from('slot_availability').select('*').eq('id', id).maybeSingle();
  if (!s) notFound();
  const { data: bookings } = await sb.from('bookings').select('*').eq('slot_id', id).order('created_at');
  const active = (bookings || []).filter((b) => b.status === 'paid');

  return (
    <div className="wide">
      <AdminNav />
      <h1>{fmtDay(s.starts_at)}, {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}</h1>
      {sp?.saved && <p className="notice">Saved.</p>}
      {sp?.error && <p className="notice err" role="alert">{sp.error}</p>}

      <form action={saveSlot} className="stack">
        <input type="hidden" name="id" value={s.id} />
        <div className="grid2">
          <label>Starts (Budapest time)<input type="datetime-local" name="starts" defaultValue={toLocalInput(s.starts_at)} required /></label>
          <label>Ends<input type="datetime-local" name="ends" defaultValue={toLocalInput(s.ends_at)} required /></label>
          <label>Places<input type="number" name="capacity" defaultValue={s.capacity} /></label>
          <label>Audience
            <select name="audience" defaultValue={s.audience}>
              <option value="open">Open to everyone</option>
              <option value="women">Women only</option>
              <option value="members">Members only</option>
            </select>
          </label>
          <label>Member price (Ft)<input type="number" name="price_member" defaultValue={s.price_member} /></label>
          <label>Standard price (Ft)<input type="number" name="price_nonmember" defaultValue={s.price_nonmember} /></label>
        </div>
        <label>Title<input name="title" defaultValue={s.title || ''} /></label>
        <label>Note shown to guests<input name="notes" defaultValue={s.notes || ''} /></label>
        <label className="check"><input type="checkbox" name="is_private" defaultChecked={s.is_private} />Private session (one booking takes the whole sauna at the standard price)</label>
        <label className="check"><input type="checkbox" name="is_published" defaultChecked={s.is_published} />Published</label>
        <p className="hint">Changing the start time emails everyone who has booked and lets them cancel for a full refund.</p>
        <button type="submit">Save</button>
      </form>

      <h2 style={{ marginTop: 40 }}>Roster ({s.taken}/{s.capacity} places)</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Places</th><th>Paid</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(bookings || []).map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td><td>{b.email}</td><td>{b.quantity}</td>
                <td>{huf(b.total_price)} {b.is_member_rate ? '(member)' : ''} {b.payment_method === 'manual' ? '(manual)' : ''}</td>
                <td>{b.status}{b.paid_at ? ` ${fmtStamp(b.paid_at)}` : ''}</td>
                <td>
                  {b.status === 'paid' && (
                    <form action={adminCancel}>
                      <input type="hidden" name="booking_id" value={b.id} />
                      <input type="hidden" name="slot_id" value={s.id} />
                      <button className="ghost" type="submit">Cancel and refund</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 32 }}>Add a booking by hand (cash or bank transfer)</h3>
      <form action={addManualBooking} className="stack">
        <input type="hidden" name="slot_id" value={s.id} />
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Places<input name="qty" type="number" defaultValue="1" min="1" /></label>
        <button type="submit">Add as paid</button>
      </form>

      <form action={deleteSlot} style={{ marginTop: 40 }}>
        <input type="hidden" name="id" value={s.id} />
        <button className="danger" type="submit">Delete session</button>
        <span className="hint"> Only possible when it has no bookings.</span>
      </form>
    </div>
  );
}
