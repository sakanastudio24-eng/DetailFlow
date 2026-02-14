# Email Rollout Plan

## Stage 1: Development Baseline
1. Configure API env vars with test addresses.
2. Keep domain/sender in sandbox-compatible mode.
3. Submit sample bookings and verify logs.

## Stage 2: Template Readiness
1. Create customer and owner templates in Resend dashboard.
2. Assign template IDs to env vars.
3. Validate variable substitution and branding.

## Stage 3: Domain Authentication
1. Configure SPF and DKIM for sender domain.
2. Verify sender domain in provider dashboard.
3. Test deliverability to internal inboxes.

## Stage 4: Production Enablement
1. Enable owner sends (`EMAIL_OWNER_ENABLED=true`).
2. Enable customer sends (`EMAIL_CUSTOMER_ENABLED=true`).
3. Run smoke tests from real booking UI.

## Stage 5: Early Monitoring Window (First 7 Days)
1. Review `data/email_failures.json` daily.
2. Track repeated error classes.
3. Confirm booking acceptance rate is unaffected.

## Rollback Strategy
- If delivery instability occurs:
- set `EMAIL_CUSTOMER_ENABLED=false`
- keep owner notifications enabled if stable
- if needed, set `EMAIL_OWNER_ENABLED=false`
- continue accepting bookings and preserve data

## Deferred Work (Phase 2+)
- Add retry worker/job for failure queue.
- Add provider webhooks for delivery/open status.
- Add SMS provider integration with consent-compliant flow.
