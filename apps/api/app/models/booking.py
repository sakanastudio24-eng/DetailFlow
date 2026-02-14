from pydantic import BaseModel, EmailStr


class CustomerBooking(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    zipCode: str
    notes: str = ""
    acceptedConsent: bool


class VehicleSelection(BaseModel):
    id: str
    label: str
    make: str
    model: str
    year: str
    color: str
    serviceIds: list[str]


class BookingIntakeRequest(BaseModel):
    customer: CustomerBooking
    vehicles: list[VehicleSelection]
