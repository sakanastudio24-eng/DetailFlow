# Email API Contract

## Booking Intake APIs

### Primary Endpoint
- Method: `POST`
- Path: `/cal-bookings`
- Success response:
```json
{
  "status": "accepted",
  "message": "Booking intake confirmed."
}
```

### Compatibility Alias
- Method: `POST`
- Path: `/booking-intakes`
- Behavior: same processing logic as `/cal-bookings`

## Booking Request Payload
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
  ],
  "honeypot": ""
}
```

## Validation Rules
1. `customer.fullName` must include first and last name.
2. `customer.email` must be valid email format.
3. `customer.phone` must include at least 10 digits.
4. `customer.zipCode` must be present and valid length.
5. At least one confirmation channel must be selected.
6. SMS consent is required if SMS confirmation is selected.
7. At least one vehicle is required.
8. Each vehicle must include year, make, model, color.
9. Each vehicle must include at least one service ID.

## Processing Side Effects
1. Persist booking in `data/bookings.json` first.
2. Attempt owner notification send (always).
3. Attempt customer confirmation send only when:
- `customer.sendEmailConfirmation=true`
- `EMAIL_CUSTOMER_ENABLED=true`
4. Persist send failures to `data/email_failures.json`.

## Failure Contract
- Honeypot-filled requests return accepted and skip persistence/send.
- Email send failures do not fail booking acceptance after persistence.
- Storage failure still fails the request.

## Persistence Shapes

### `bookings.json` row
- `bookingId`
- `submittedAt`
- `customer`
- `vehicles`

### `email_failures.json` row
- `loggedAt`
- `bookingId`
- `recipientRole` (`owner`, `customer`, `system`)
- `provider`
- `to`
- `errorSummary`
- `retryStatus`

## Template Admin API
All `/template-admin/*` routes require:
- `Authorization: Bearer <TEMPLATE_ADMIN_TOKEN>`

### Endpoints
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

### Create Request Shape
```json
{
  "name": "order-confirmation",
  "html": "<p>Name: {{{PRODUCT}}}</p><p>Total: {{{PRICE}}}</p>",
  "variables": [
    {
      "key": "PRODUCT",
      "type": "string",
      "fallback_value": "item"
    },
    {
      "key": "PRICE",
      "type": "number",
      "fallback_value": 20
    }
  ]
}
```

### Update Request Shape
```json
{
  "name": "order-confirmation-v2",
  "html": "<p>Total: {{{PRICE}}}</p><p>Name: {{{PRODUCT}}}</p>"
}
```

### Response Envelopes
Non-list:
```json
{
  "status": "ok",
  "operation": "create|get|update|publish|duplicate|delete",
  "data": {}
}
```

List:
```json
{
  "status": "ok",
  "operation": "list",
  "templates": [],
  "pagination": {
    "after": null,
    "next": null,
    "has_more": null,
    "object": null
  }
}
```

### Template Admin Error Codes
- `401`: missing or invalid bearer token
- `503`: admin token not configured
- `502`: upstream provider failure (sanitized)
