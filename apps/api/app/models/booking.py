from pydantic import BaseModel, EmailStr


class BookingIntake(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    selected_services: list[str]
    notes: str | None = None
