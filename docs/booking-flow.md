# Booking Flow (Implemented V1)

1. Customer configures services per vehicle in `/services`.
2. Dock stores multiple vehicles and selected services in client state.
3. Customer completes intake fields in `/booking`.
4. Customer selects confirmation preferences (email and/or SMS with explicit SMS consent).
5. Frontend submits intake payload to FastAPI `POST /booking-intakes`.
6. API validates confirmation preference rules.
7. API stores intake in `data/bookings.json`.
8. API attempts owner notification email (always, when enabled).
9. API attempts customer confirmation email only if `sendEmailConfirmation=true` (when enabled).
10. API logs any delivery failures to `data/email_failures.json` and still returns accepted status.
11. Frontend redirects user to Setmore for final time-slot booking.

## Parallel Contact Flow
- `/contact` posts non-booking questions to `POST /contact-messages`.
- API stores contact messages in `data/contacts.json`.
