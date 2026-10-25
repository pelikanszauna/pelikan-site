export const metadata = { title: 'Back soon · Pelikan Szauna' };

// Edit the words and the form link here.
const TEXT = 'Booking is switched off for now. Use the button below to stay in touch.';
const BUTTON = 'Stay in touch';
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
