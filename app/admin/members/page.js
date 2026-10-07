import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { fmtStamp } from '@/lib/time';
import AdminNav from '../AdminNav';
import { setMemberStatus, addMember } from '../actions';

export const dynamic = 'force-dynamic';

function StatusButton({ id, status, label }) {
  return (
    <form action={setMemberStatus} className="inline">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} />
      <button className="ghost" type="submit">{label}</button>
    </form>
  );
}

export default async function Members() {
  await requireAdmin();
  const sb = db();
  const { data: members } = await sb.from('members').select('*').order('created_at', { ascending: false });
  const { data: noms } = await sb.from('friend_nominations').select('*').order('created_at', { ascending: false });
  const friendsOf = (email) => (noms || []).filter((n) => n.applicant_email === email);
  return (
    <div className="wide">
      <AdminNav />
      <h1>Members</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Szauna friends</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {(members || []).map((m) => (
              <tr key={m.id}>
                <td>{m.name}{m.note ? <div className="hint">{m.note}</div> : null}</td>
                <td>{m.email}</td><td>{m.status}</td>
                <td>{friendsOf(m.email).map((n) => <div key={n.id}>{n.friend_1}, {n.friend_2}</div>)}</td>
                <td>{fmtStamp(m.expires_at)}</td>
                <td className="row">
                  {m.status !== 'active' && <StatusButton id={m.id} status="active" label="Approve (1 year)" />}
                  {m.status === 'pending' && <StatusButton id={m.id} status="rejected" label="Decline" />}
                  {m.status === 'active' && <StatusButton id={m.id} status="lapsed" label="Mark lapsed" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{ marginTop: 32 }}>Add an existing member</h3>
      <form action={addMember} className="stack">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <button type="submit">Add as active member</button>
      </form>
    </div>
  );
}
