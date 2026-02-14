# Email API Contract

## Booking Intake Endpoint
- Method: `POST`
- Path: `/booking-intakes`
- Success response: `200` with `{ "status": "accepted" }`

## Request Contract
```json
{
  "customer": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "(555) 123-4567",
    "zipCode": "90210",
    "sendEmailConfirmation": true,
    "sendSmsConfirmation": false,
    "acceptedSmsConsent": false,
    "notes": "Gate code 4242",
    "acceptedConsent": true
  },
  "vehicles": [
    {
      "id": "vehicle-1",
      "label": "Vehicle 1",
      "make": "Toyota",
      "model": "Camry",
      "year": "2021",
      "color": "Silver",
      "serviceIds": ["pkg-standard", "addon-engine"]
    }
  ]
}
```

## Validation Contract
1. Booking intake is valid only if at least one confirmation channel is selected:
- `sendEmailConfirmation=true` OR `sendSmsConfirmation=true`.

2. SMS consent rule:
- If `sendSmsConfirmation=true`, then `acceptedSmsConsent` must be `true`.

3. Email format rule:
- `customer.email` must be valid email syntax.

## Side Effects Contract
1. Always persist intake to `data/bookings.json` (source of truth).
2. Attempt owner notification email based on env toggles.
3. Attempt customer confirmation email based on preference and env toggles.
4. On email failure, write one failure record per failed recipient to `data/email_failures.json`.

## Failure Contract
- Email transport failures do not change booking endpoint success if storage succeeded.
- Storage failure still fails the endpoint normally.

## Internal Persistence Contract
### Booking record fields
- `submittedAt`: ISO timestamp in UTC
- `bookingId`: generated ID
- `customer`: submitted customer object
- `vehicles`: submitted vehicle array

### Email failure record fields
- `loggedAt`: ISO timestamp in UTC
- `bookingId`: booking reference
- `recipientRole`: `owner` or `customer`
- `provider`: provider name, e.g., `resend`
- `to`: recipient address
- `errorSummary`: concise provider error
- `retryStatus`: `pending` in V1
