# Cruzn Clean V2

Production-oriented detailing website portfolio project with a Next.js frontend and FastAPI backend.

## Tech Stack
- Web: Next.js (App Router), TypeScript, React, Tailwind CSS
- API: FastAPI (Python)
- Email: Resend
- V1 persistence: local JSON files in `data/`

## Core Web Routes
- `/` home
- `/services` multi-vehicle service builder
- `/booking` booking intake
- `/email-preview` public mock preview for customer/owner emails
- `/contact` non-booking questions
- `/quote` quote request
- `/gallery`, `/faq`, `/privacy`, `/terms`

## API Routes
- `POST /cal-bookings` primary booking intake endpoint
- `POST /booking-intakes` compatibility alias (same behavior)
- `POST /contact-messages` contact form endpoint
- `GET /health` health check

### Template Admin Routes (Protected)
All template-admin routes require:
- `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`

Routes:
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

## Booking Email Flow
1. Booking payload is validated.
2. Booking is persisted to `data/bookings.json`.
3. Owner notification email is always attempted.
4. Customer confirmation email is attempted only when:
- `customer.sendEmailConfirmation=true`
- `EMAIL_CUSTOMER_ENABLED=true`
5. Email send failures are logged to `data/email_failures.json`.
6. Booking API stays non-blocking on email provider failures.

## Environment Setup
`.env` files are git-ignored. Keep secrets local/runtime only.

### API `.env` keys
Required:
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `BOOKING_OWNER_EMAIL`
- `EMAIL_FROM`
- `TEMPLATE_ADMIN_TOKEN`

Optional:
- `EMAIL_REPLY_TO` (defaults to `EMAIL_FROM`)
- `EMAIL_CUSTOMER_ENABLED=true|false`
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- `OWNER_BOOKING_MANAGE_URL` (supports `{booking_id}` placeholder)
- `PUBLIC_SITE_URL`

### Web `.env` keys
- `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`)
- `NEXT_PUBLIC_CAL_COM_URL`
- `NEXT_PUBLIC_SETMORE_URL` (legacy fallback)

## Local Development
### Web
```bash
cd apps/web
npm install
npm run dev
```

### API
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Security Notes
- Never commit real API keys or tokens.
- Keep template admin token private and rotate if exposed.
- `/email-preview` is mock-only and does not use provider credentials.

## Documentation Index
- `docs/architecture.md`
- `docs/booking-flow.md`
- `docs/routes.md`
- `docs/email-confirmation-spec.md`
- `docs/email-api-contract.md`
- `docs/email-env-matrix.md`
- `docs/email-ops-runbook.md`
- `docs/email-rollout-plan.md`
- `docs/email-testing-checklist.md`
- `docs/email-troubleshooting.md`
