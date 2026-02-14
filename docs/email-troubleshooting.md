# Email Troubleshooting Guide

## Symptom: Bookings save but no emails arrive
Checks:
1. Confirm `EMAIL_OWNER_ENABLED` / `EMAIL_CUSTOMER_ENABLED` flags.
2. Confirm `RESEND_API_KEY` is set and valid.
3. Confirm `BOOKING_OWNER_EMAIL` is valid.
4. Inspect `data/email_failures.json` for provider errors.

## Symptom: Customer email not sent
Checks:
1. Verify booking payload has `sendEmailConfirmation=true`.
2. Verify `EMAIL_CUSTOMER_ENABLED=true`.
3. Check failure logs for recipient-role `customer`.

## Symptom: Owner email not sent
Checks:
1. Verify `EMAIL_OWNER_ENABLED=true`.
2. Verify `BOOKING_OWNER_EMAIL` configured.
3. Check failure logs for recipient-role `owner`.

## Symptom: Template variables missing
Checks:
1. Confirm template IDs point to intended templates.
2. Confirm variable names in provider template match backend payload keys.
3. Temporarily remove template IDs to use fallback HTML/text rendering for isolation.

## Symptom: Endpoint returns validation error
Checks:
1. At least one confirmation channel must be selected.
2. If SMS confirmation is selected, SMS consent must be true.
3. Email must pass syntax validation.

## Symptom: High failure volume
Actions:
1. Keep booking endpoint active (non-blocking policy).
2. Toggle off customer sends first.
3. Investigate provider status and auth records.
4. Re-enable after smoke test passes.
