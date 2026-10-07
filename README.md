# Pelikan Szauna booking site

Next.js + Supabase (database) + Stripe (payments). Sessions, live availability, card payment,
24-hour cancellation with automatic refund, membership pricing, an admin area, and a Google Sheets export.

## Set up (about an hour)

1. **Supabase** (supabase.com, free plan): create a project. SQL Editor > New query > paste
   `supabase/schema.sql` > Run. Copy the Project URL and the `service_role` key (Project settings > API).
2. **Stripe** (stripe.com): use *test mode* first. Copy the secret key (`sk_test_...`).
   Later, create the account for the egyesület and swap in live keys.
3. **Vercel** (vercel.com, free plan): import this folder (via GitHub), and add every variable from
   `.env.example` under Settings > Environment Variables. Set `SITE_URL` to your Vercel address for now.
4. **Stripe webhook:** Stripe > Developers > Webhooks > Add endpoint:
   `SITE_URL/api/stripe/webhook`, events `checkout.session.completed` and `checkout.session.expired`.
   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`, then redeploy.
5. Go to `SITE_URL/admin`, sign in, **Create sessions** (defaults are Thu to Sun, 12:30 to 18:30,
   15 Oct to 15 Nov), and test a booking with Stripe's test card `4242 4242 4242 4242`.
6. **Domain:** in Vercel, Settings > Domains, add yours and follow the DNS steps. Update `SITE_URL`.
7. **Emails (optional):** make a free Resend account, verify your domain, add `RESEND_API_KEY` and `EMAIL_FROM`.

Run locally instead: `npm install`, copy `.env.example` to `.env.local`, fill it in, `npm run dev`.

## Google Sheets

`sheets/apps-script.gs` has the setup steps at the top. It pulls two tabs (`finance`, `slots`) using
`EXPORT_TOKEN_FINANCE`, which exposes no names or emails. For everything use
`/api/export?kind=bookings|members` with `EXPORT_TOKEN_FULL` (keep that one out of shared sheets).

## Known limits of this first version

- **Member price** applies when the booking email matches an active member. There is no email
  verification yet, so someone could type a member's address. Next step: email sign-in links.
- **Women-only** sessions rely on the honour system.
- **Membership fee** (5 000 Ft) is not charged online yet. Approve members in `/admin/members`.
- **Számla** is not issued yet. The place to add it is marked `TODO` in
  `app/api/stripe/webhook/route.js` (Számlázz.hu or Billingo API).
- A guest who pays after the 31-minute hold expired is still confirmed, even if the session has since filled up.
  Check the roster if you see a session over capacity.
