# Email Confirmation Specification (Phase V1)

## Purpose
Define transactional booking email behavior for Cruz N Clean V2 using a hybrid model:
- FastAPI controls trigger logic and payload mapping.
- Resend handles delivery and no-code template management.

## Goals
- Send customer confirmation email when customer opted into email confirmations.
- Send owner notification email for every accepted booking intake.
- Never block booking intake success when email delivery fails.
- Persist actionable failure metadata to local JSON logs.

## Non-Goals (V1)
- SMS delivery implementation.
- Retry queue/worker orchestration.
- Marketing campaign sending.

## Trigger Source
- Endpoint: `POST /booking-intakes`
- Trigger moment: after booking intake is persisted to `data/bookings.json`.

## Send Rules
1. Owner notification
- Always attempted when `EMAIL_OWNER_ENABLED=true`.
- Recipient from `BOOKING_OWNER_EMAIL`.

2. Customer confirmation
- Attempted only when both conditions are true:
- `EMAIL_CUSTOMER_ENABLED=true`
- `customer.sendEmailConfirmation=true`

3. SMS preference handling
- `sendSmsConfirmation` and `acceptedSmsConsent` are stored and validated.
- No SMS provider send is attempted in V1.

## Delivery Policy
- Policy: non-blocking.
- Booking API returns accepted once storage succeeds.
- Email failures are logged to `data/email_failures.json`.

## Template Model
- Primary mode: provider-managed Resend templates.
- Required IDs:
- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- Fallback mode (when template IDs are absent): provider API sends generated HTML + text bodies.

## Template Variables
- Booking identifiers: `bookingId`, `submittedAt`.
- Customer profile: name, email, phone, zip.
- Preferences: email confirmation flag, SMS preference, SMS consent.
- Vehicles: label/year/make/model/color, service IDs, estimated subtotal.
- Booking estimate: estimated grand total (from static service map in API).

## Failure Handling
- Each failed send writes one failure row with:
- `loggedAt`
- `bookingId`
- `recipientRole` (`owner` or `customer`)
- `provider`
- `to`
- `errorSummary`
- `retryStatus` (`pending` in V1)

## Security and Compliance Notes
- API key is read from env var only.
- No secret values are persisted to JSON logs.
- Email channel is transactional only in V1.
- Privacy policy and legal review required before public launch.
