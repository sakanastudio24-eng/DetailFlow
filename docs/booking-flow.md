# Booking Flow (Implemented V1)

1. Customer configures services per vehicle in `/services`.
2. Dock stores multiple vehicles and selected services in client state.
3. Customer completes intake fields in `/booking`.
4. Customer selects confirmation preferences (email and/or SMS with explicit SMS consent).
5. Frontend submits intake payload to FastAPI `POST /booking-intakes`.
6. API stores intake in `data/bookings.json`.
7. Frontend redirects user to Setmore for final time-slot booking.

## Parallel Contact Flow
- `/contact` posts non-booking questions to `POST /contact-messages`.
- API stores contact messages in `data/contacts.json`.
