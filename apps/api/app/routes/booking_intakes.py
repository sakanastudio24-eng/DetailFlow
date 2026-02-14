from fastapi import APIRouter

from app.models.booking import BookingIntakeRequest
from app.services.storage import append_booking_record

router = APIRouter(prefix="/booking-intakes", tags=["booking"])


@router.post("")
def create_booking_intake(payload: BookingIntakeRequest) -> dict[str, str]:
    append_booking_record(payload.model_dump())
    return {"status": "accepted"}
