import { requireAdmin } from '@/lib/auth';
import AdminNav from '../AdminNav';
import { generateSlots } from '../actions';

const DAYS = [['1', 'Mon'], ['2', 'Tue'], ['3', 'Wed'], ['4', 'Thu'], ['5', 'Fri'], ['6', 'Sat'], ['0', 'Sun']];

export default async function Generate() {
  await requireAdmin();
  return (
    <div className="wide">
      <AdminNav />
      <h1>Create sessions</h1>
      <p className="hint">Times are Budapest time. Sessions that already exist at the same start time are skipped. You can edit each one afterwards.</p>
      <form action={generateSlots} className="stack">
        <div className="grid2">
          <label>From<input type="date" name="from" defaultValue="2026-10-15" required /></label>
          <label>To<input type="date" name="to" defaultValue="2026-11-15" required /></label>
        </div>
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600 }}>Days</legend>
          <div className="row">
            {DAYS.map(([v, l]) => (
              <label key={v} className="check"><input type="checkbox" name="day" value={v} defaultChecked={['4', '5', '6', '0'].includes(v)} />{l}</label>
            ))}
          </div>
        </fieldset>
        <label>Start times<input name="times" defaultValue="12:30, 14:00, 15:30, 17:00" /></label>
        <div className="grid2">
          <label>Length (minutes)<input type="number" name="duration" defaultValue="90" /></label>
          <label>Places<input type="number" name="capacity" defaultValue="7" /></label>
          <label>Member price (Ft)<input type="number" name="price_member" defaultValue="3000" /></label>
          <label>Standard price (Ft)<input type="number" name="price_nonmember" defaultValue="4000" /></label>
        </div>
        <label>Audience
          <select name="audience" defaultValue="open">
            <option value="open">Open to everyone</option>
            <option value="women">Women only</option>
            <option value="members">Members only</option>
          </select>
        </label>
        <label>Title (optional)<input name="title" /></label>
        <button type="submit">Create sessions</button>
      </form>
    </div>
  );
}
