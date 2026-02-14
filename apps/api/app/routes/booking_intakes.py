from fastapi import APIRouter

from app.models.booking import BookingIntakeRequest
from app.services.email import send_booking_transactional_emails
from app.services.storage import append_booking_record, append_email_failure_record

router = APIRouter(prefix="/booking-intakes", tags=["booking"])


@router.post("")
def create_booking_intake(payload: BookingIntakeRequest) -> dict[str, str]:
    persisted_booking = append_booking_record(payload.model_dump())

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

    return {"status": "accepted"}
