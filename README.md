# Cruz N Clean V2

Documentation-first rebuild of a car detailing portfolio and booking website.

## Stack
- Frontend: Next.js + TypeScript + React + Tailwind CSS + shadcn-compatible structure
- Backend: FastAPI (minimal API)
- Storage (V0): JSON files (designed for later Supabase migration)

## Email Architecture (Hybrid Model)
- Trigger logic, preference validation, and failure policy are handled in FastAPI.
- Delivery provider is Resend.
- Template styling and copy can be managed in the provider dashboard without code deploys.
- Booking acceptance is non-blocking for email failures:
- Booking is saved first.
- Email send attempts run second.
- Failures are logged for operational follow-up.

## Current Routes
- `/` Home
- `/services` Multi-vehicle service planner with docking station
- `/booking` Booking intake form (then redirect to Setmore)
- `/email-preview` Public mock email previews (customer + owner)
- `/contact` Question-only contact form
- `/quote` Quote request form
- `/gallery`
- `/faq`
- `/privacy`
- `/terms`
- `/styleguide` (internal)

## Contact vs Book Now
- `Contact` is for questions only.
- `Book Now` is for appointment intake and Setmore handoff.

## Local Development

### Web
```bash
cd apps/web
npm install
npm run dev
```
Open `http://127.0.0.1:3000`.

### API
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Environment Variables (Web)
- `NEXT_PUBLIC_API_BASE_URL` (default: `http://127.0.0.1:8000`)
- `NEXT_PUBLIC_SETMORE_URL` (default: `https://www.setmore.com`)

## Environment Variables (API)
- `EMAIL_PROVIDER` (default: `resend`)
- `RESEND_API_KEY` (secret, never commit real values)
- `TEMPLATE_ADMIN_TOKEN` (secret bearer token for `/template-admin/*`)
- `BOOKING_OWNER_EMAIL`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` (optional, defaults to `EMAIL_FROM`)
- `EMAIL_OWNER_ENABLED` (default: `true`)
- `EMAIL_CUSTOMER_ENABLED` (default: `true`)
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION` (optional)
- `RESEND_TEMPLATE_OWNER_NOTIFICATION` (optional)

## Operational Behavior
- `POST /booking-intakes` persists first to `data/bookings.json`.
- Owner notification is attempted on every booking when enabled.
- Customer confirmation is attempted only when customer opted into email confirmation and sending is enabled.
- Email send failures do not fail booking acceptance.
- Email send failures are logged to `data/email_failures.json` with retry status metadata for manual operations.

## Template Ownership
- Visual template edits are owned in Resend template editor.
- Backend passes structured booking variables.
- If template IDs are not configured, backend uses fallback HTML/text bodies.

## Template Admin Endpoints
- `POST /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`
- `GET /template-admin/templates?limit=&after=`
- Auth required on all routes: `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`
- Security note: API keys and admin token stay server-side only and must never be exposed in web code.

## Preview Route Notes
- `/email-preview` is public and mock-only.
- It does not call the provider API and does not require admin credentials.

## Documentation Index
- `docs/architecture.md`
- `docs/booking-flow.md`
- `docs/email-confirmation-spec.md`
- `docs/email-api-contract.md`
- `docs/email-env-matrix.md`
- `docs/email-ops-runbook.md`
- `docs/email-testing-checklist.md`
- `docs/email-rollout-plan.md`
- `docs/email-troubleshooting.md`
- `DEV_GUIDE.md`
