# Email Testing Checklist

## Unit-Level
- [ ] Confirmation preference validation rejects no-channel payload.
- [ ] SMS consent validation rejects SMS-without-consent payload.
- [ ] Vehicle estimate mapping returns expected per-vehicle and grand totals.
- [ ] Customer email gating respects `sendEmailConfirmation`.
- [ ] Owner email path always attempts when enabled.

## Integration-Level
- [ ] `POST /booking-intakes` persists booking record.
- [ ] Endpoint returns accepted when provider send fails.
- [ ] Failed send appends row to `data/email_failures.json`.
- [ ] Both owner/customer emails sent on full valid payload.
- [ ] Owner-only email sent when customer email preference is disabled.

## UI-Level
- [ ] Booking form shows confirmation preferences block.
- [ ] SMS consent checkbox appears only when SMS confirmation selected.
- [ ] Validation message appears for missing confirmation channel.
- [ ] Booking flow still redirects to Setmore after accepted response.

## Responsive Regression
- [ ] `<=479px` booking form is usable and controls are visible.
- [ ] `480-767px` no overlap with fixed bottom nav.
- [ ] `768-1023px` tablet layout remains functional with bottom nav.
- [ ] `>=1024px` desktop summary column behavior unchanged.

## Email Client Manual QA
- [ ] Customer email looks correct in Gmail.
- [ ] Customer email looks correct in Apple Mail.
- [ ] Owner notification renders data blocks correctly.
- [ ] Links and text fallback content are readable.
