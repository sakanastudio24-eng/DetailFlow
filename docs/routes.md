# Routes (Current)

## Public Web Routes
- `/`
- `/services`
- `/booking`
- `/email-preview`
- `/gallery`
- `/quote`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`

## Internal Web Route
- `/styleguide`

## API Routes
- `POST /cal-bookings`
- `POST /booking-intakes` (compatibility alias)
- `POST /contact-messages`
- `GET /health`
- `POST /template-admin/templates`
- `GET /template-admin/templates`
- `GET /template-admin/templates/{template_id}`
- `PATCH /template-admin/templates/{template_id}`
- `POST /template-admin/templates/{template_id}/publish`
- `POST /template-admin/templates/{template_id}/duplicate`
- `DELETE /template-admin/templates/{template_id}`

## Booking vs Contact Intent
- `/booking`: appointment intake + calendar handoff (Cal.com)
- `/contact`: non-booking questions
