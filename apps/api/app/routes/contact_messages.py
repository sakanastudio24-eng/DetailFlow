from fastapi import APIRouter

from app.models.contact import ContactMessageRequest
from app.services.storage import append_contact_record

router = APIRouter(prefix="/contact-messages", tags=["contact"])


@router.post("")
def create_contact_message(payload: ContactMessageRequest) -> dict[str, str]:
    append_contact_record(payload.model_dump())
    return {"status": "accepted"}
