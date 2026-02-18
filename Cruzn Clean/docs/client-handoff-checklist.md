# Client Handoff Checklist (Demo)

## 1) Environment and Secrets
- [ ] Create local/runtime `.env` files for web and API only (never commit real values).
- [ ] Set `RESEND_API_KEY`.
- [ ] Set `TEMPLATE_ADMIN_TOKEN` (long random token, operator-only).
- [ ] Set `EMAIL_FROM`, `EMAIL_REPLY_TO`, and `BOOKING_OWNER_EMAIL`.
- [ ] Set `PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL`.
- [ ] Set `NEXT_PUBLIC_CAL_COM_URL`.

## 2) Endpoint Readiness Verification
- [ ] `GET /health` returns `{"status":"ok"}`.
- [ ] `POST /booking-intakes` accepts a valid payload and persists booking.
- [ ] `POST /cal-bookings` behaves the same as booking alias.
- [ ] `POST /contact-messages` stores contact payload correctly.
- [ ] `POST /template-admin/*` returns `401` without bearer token.
- [ ] `POST /template-admin/*` works with valid bearer token.

## 3) Security Verification (Demo Baseline)
- [ ] Confirm no secrets are committed in git history or tracked files.
- [ ] Confirm template-admin token is never sent from frontend browser code.
- [ ] Confirm CORS is appropriate for demo hosts.
- [ ] Confirm booking honeypot behavior works (filled honeypot accepted silently).
- [ ] Confirm 3-vehicle/day policy returns `422` when exceeded.

## 4) Email Flow Verification
- [ ] Booking with customer opt-in true attempts owner + customer emails.
- [ ] Booking with customer opt-in false attempts owner email only.
- [ ] Provider failure logs rows to `data/email_failures.json`.
- [ ] Customer/owner emails show DetailFlow branding and grayscale styling.

## 5) UX and Demo Script Checks
- [ ] Home, services, booking, quote, gallery, and email preview routes load.
- [ ] Mobile bottom nav and footer behavior render correctly at demo breakpoints.
- [ ] Booking submission shows clear success state and validation messages.
- [ ] Email preview page clearly indicates mock-only preview behavior.

## 6) Deployment and Ops
- [ ] Deploy web and API to demo hosts with HTTPS.
- [ ] Verify API base URL in web env points to deployed API.
- [ ] Verify Resend domain auth (SPF/DKIM) before live sends.
- [ ] Confirm logs for booking, contact, and email failures are accessible.

## 7) Final Notes
- Demo-ready: booking intake, owner/customer email pipeline, template-admin auth, and core route set.
- Not production-hardened yet: booking rate limiter is placeholder and contact endpoint lacks anti-spam guard.
- Recommended next hardening phase:
1. Implement real per-IP rate limiting for booking and contact endpoints.
2. Add contact honeypot/captcha.
3. Move persistence from local JSON files to Supabase/Postgres.
4. Add structured request logging + alerting for repeated failures.
