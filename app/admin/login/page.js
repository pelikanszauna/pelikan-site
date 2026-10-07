import { login } from '../actions';
export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <section className="hero">
      <h1>Admin</h1>
      {sp?.error && <p className="notice err" role="alert">Wrong password.</p>}
      <form action={login} className="stack">
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}
