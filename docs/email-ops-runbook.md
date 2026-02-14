# Email Operations Runbook (V1)

## Purpose
Daily operational process for transactional booking emails.

## Daily Checks
1. Confirm API health endpoint is healthy.
2. Inspect `data/email_failures.json` for new failures.
3. Confirm recent bookings exist in `data/bookings.json`.
4. Validate owner inbox receives new booking notifications.

## Failure Log Review
- File: `data/email_failures.json`
- Review by:
- `loggedAt` recency
- `recipientRole`
- repeated `errorSummary` patterns
- unresolved `retryStatus=pending`

## Immediate Mitigations
1. If provider key expired:
- rotate `RESEND_API_KEY`
- restart API process

2. If owner recipient invalid:
- correct `BOOKING_OWNER_EMAIL`
- restart API process

3. If provider outage:
- leave booking flow active
- keep non-blocking policy
- announce temporary notification delay internally

## Safe Toggle Controls
- Disable owner sends: `EMAIL_OWNER_ENABLED=false`
- Disable customer sends: `EMAIL_CUSTOMER_ENABLED=false`

## Incident Classification
- P1: booking endpoint failing to persist intake
- P2: all outbound emails failing but bookings continue
- P3: template rendering issue in a subset of emails

## Recovery Validation
1. Submit a test booking.
2. Confirm booking persisted.
3. Confirm owner/customer email behavior according to toggles.
4. Confirm no new failure rows or expected failure rows only.
