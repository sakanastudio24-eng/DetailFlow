# Booking Flow (Implemented V1)

1. Customer configures services per vehicle in `/services`.
2. Dock stores multiple vehicles and selected services in client state.
3. Customer completes intake fields in `/booking`.
4. Frontend submits intake payload to FastAPI `POST /booking-intakes`.
5. API stores intake in `data/bookings.json`.
6. Frontend redirects user to Setmore for final time-slot booking.

## Parallel Contact Flow
- `/contact` posts non-booking questions to `POST /contact-messages`.
- API stores contact messages in `data/contacts.json`.
