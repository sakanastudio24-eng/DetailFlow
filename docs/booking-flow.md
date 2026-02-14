# Booking Flow (Current)

## Customer Path
1. Customer selects services per vehicle in `/services`.
2. Vehicle/service state is carried into `/booking`.
3. Customer completes intake fields and communication preferences.
4. Frontend posts payload to `POST /cal-bookings`.
5. API returns accepted and frontend shows confirmation state.
6. Customer proceeds to Cal.com for slot selection.

## API Processing Order
1. Validate payload (name, email, vehicle fields, service selection, consent rules).
2. Run anti-bot honeypot check.
3. Run rate-limit placeholder hook.
4. Persist booking in `data/bookings.json`.
5. Trigger transactional email pipeline.
6. Log any email failure rows in `data/email_failures.json`.
7. Return accepted response regardless of send failure if persistence succeeded.

## Email Send Rules
- Owner notification: always attempted.
- Customer confirmation: attempted only when `customer.sendEmailConfirmation=true` and `EMAIL_CUSTOMER_ENABLED=true`.
- SMS preference is captured/validated, but SMS delivery is not part of V1.

## Parallel Contact Flow
- `/contact` submits to `POST /contact-messages`.
- Contact payloads are persisted to `data/contacts.json`.
