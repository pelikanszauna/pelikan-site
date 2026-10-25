export const metadata = { title: 'Back soon · Pelikan Szauna' };

// Edit the words and the form link here.
const TEXT = 'Book using this link for now. The button takes you there.';
const BUTTON = 'Booking Link';
const FORM_URL = 'https://form.everestwebdeals.co/?form=1fd03dc415923b77fd474f064274b8a2';

export default function Offline() {
  return (
    <section className="hero">
      <h1>Back soon.</h1>
      <p>{TEXT}</p>
      <div className="row">
        <a className="btn" href={FORM_URL} rel="noopener">{BUTTON}</a>
      </div>
    </section>
  );
}
