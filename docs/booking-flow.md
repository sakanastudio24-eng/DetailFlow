# Booking Flow (V1)

1. User enters car details and selected services on `/booking`.
2. Frontend sends intake payload to FastAPI endpoint.
3. API stores intake record in local JSON.
4. API sends confirmation email to:
   - business owner
   - client
5. Frontend redirects to Setmore for final appointment time booking.

## Pending Inputs
- Final Setmore redirect URL format
- Final email provider choice
- Consent copy for email/SMS terms
