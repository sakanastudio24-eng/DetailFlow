# Email Environment Matrix

## Required (API)
- `EMAIL_PROVIDER`
- Default: `resend`
- V1 supported value: `resend`

- `RESEND_API_KEY`
- Secret API key for provider delivery API.

- `BOOKING_OWNER_EMAIL`
- Recipient for owner booking notifications.

- `EMAIL_FROM`
- Transactional sender address.
- Example: `bookings@yourdomain.com`

## Optional (API)
- `EMAIL_REPLY_TO`
- Default: `EMAIL_FROM`.

- `EMAIL_OWNER_ENABLED`
- Default: `true`
- Toggles owner-notification sends.

- `EMAIL_CUSTOMER_ENABLED`
- Default: `true`
- Toggles customer confirmation sends.

- `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION`
- Template ID for customer confirmation message.

- `RESEND_TEMPLATE_OWNER_NOTIFICATION`
- Template ID for owner booking alert.

## Web Environment (unchanged)
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SETMORE_URL`

## Local Development Example
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
BOOKING_OWNER_EMAIL=owner@cruznclean.com
EMAIL_FROM=bookings@cruznclean.com
EMAIL_REPLY_TO=support@cruznclean.com
EMAIL_OWNER_ENABLED=true
EMAIL_CUSTOMER_ENABLED=true
RESEND_TEMPLATE_CUSTOMER_CONFIRMATION=
RESEND_TEMPLATE_OWNER_NOTIFICATION=
```

## Notes
- Empty template IDs trigger fallback HTML/text email bodies in V1.
- For production deliverability, configure SPF/DKIM on your sending domain.
