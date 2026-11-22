# SalonBook Client

SalonBook is a responsive salon appointment-booking application. This Next.js client lets customers browse services, manage appointments and payments, while providing role-aware customer and admin dashboards.

## Key features

- Credential and Google sign-in with role-based dashboard routing
- Public service browsing and customer appointment booking/history
- Stripe Checkout handoff and webhook-confirmed payment status display
- Admin views for services, appointments, users, dashboard metrics, and read-only transactions
- Responsive UI with loading, error, toast, and confirmation states

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Better Auth, and Stripe Checkout.

## Run locally

```bash
npm install
npm run dev
```

For a production check, run `npm run lint` and `npm run build`.

## Required environment variable names

- `API_URL`
- `NEXT_PUBLIC_APP_URL`

Set `API_URL` to the local server origin when running the two projects separately. Do not commit environment files or secret values.

## Links

- Live site: https://salon-book-client-puce.vercel.app
- Client repository: https://github.com/smerfan0009-sys/salon-book-client
- Server repository: https://github.com/smerfan0009-sys/salon-book-server
