from fastapi import APIRouter, HTTPException, Request

from app.models.booking import BookingIntakeRequest
from app.services.rate_limit import is_booking_rate_limited
from app.services.email import send_booking_transactional_emails
from app.services.storage import append_booking_record, append_email_failure_record

router = APIRouter(prefix="/booking-intakes", tags=["booking"])


def process_booking_intake(payload: BookingIntakeRequest, client_ip: str | None) -> dict[str, str]:
    """Persists a booking and runs non-blocking transactional email sends."""
    if is_booking_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many booking requests. Please try again shortly.")

    if payload.honeypot.strip():
        return {"status": "accepted", "message": "Request accepted."}

    persisted_booking = append_booking_record(payload.model_dump(exclude={"honeypot"}))

    try:
        failures = send_booking_transactional_emails(persisted_booking)
    except Exception as exc:  # pragma: no cover - defensive catch for non-blocking email policy
        failures = [
            {
                "bookingId": persisted_booking.get("bookingId", "unknown"),
                "recipientRole": "system",
                "provider": "resend",
                "to": "",
                "errorSummary": f"Unexpected email pipeline error: {str(exc).strip()[:280]}",
                "retryStatus": "pending",
            }
        ]

    for failure in failures:
        append_email_failure_record(failure)

    return {"status": "accepted", "message": "Booking intake confirmed."}


@router.post("")
def create_booking_intake(payload: BookingIntakeRequest, request: Request) -> dict[str, str]:
    return process_booking_intake(payload, request.client.host if request.client else None)
