import { submitFriends } from '../actions';

export default async function Friends({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <section className="hero">
        <h1>Your two szauna friends</h1>
        <p>
          Ask two existing members to be your szauna friends. The asking is part of the ritual, so do it in person.
          Then write their email or sauna name here.
        </p>
      </section>
      {sp?.sent && <p className="notice" role="status">Thank you. We will check with them and be in touch.</p>}
      {sp?.error && <p className="notice err" role="alert">{sp.error}</p>}
      <form action={submitFriends} className="stack">
        <label>Your email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Szauna friend 1<input name="friend_1" required placeholder="Email or sauna name" /></label>
        <label>Szauna friend 2<input name="friend_2" required placeholder="Email or sauna name" /></label>
        <button type="submit">Send</button>
      </form>
    </>
  );
}
