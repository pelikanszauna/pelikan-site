import { requestMembership } from './actions';

export default async function Membership({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <section className="hero">
        <h1>Become a member</h1>
        <p>
          Membership is 5 000 Ft a year. Members pay 3 000 Ft per session instead of 4 000 Ft.
          You earn the right to join by coming to 3 sessions, or 2 if a member brings you.
        </p>
      </section>

      {sp?.sent && (
        <div className="notice" role="status">
          Request received. Next, <a href="/membership/friends">tell us your two szauna friends</a>.
        </div>
      )}
      {sp?.error && <p className="notice err" role="alert">{sp.error}</p>}

      <form action={requestMembership} className="stack">
        <label>Name<input name="name" required autoComplete="name" /></label>
        <label>Email
          <input name="email" type="email" required autoComplete="email" />
          <span className="hint">This is also how you sign in and get the member price.</span>
        </label>
        <label>Anything you want us to know?
          <textarea name="note" rows="3" />
        </label>
        <button type="submit">Request membership</button>
      </form>
    </>
  );
}
