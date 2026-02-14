from pydantic import BaseModel, EmailStr, model_validator


class CustomerBooking(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    zipCode: str
    sendEmailConfirmation: bool = True
    sendSmsConfirmation: bool = False
    acceptedSmsConsent: bool = False
    notes: str = ""
    acceptedConsent: bool

    @model_validator(mode="after")
    def validate_confirmation_preferences(self) -> "CustomerBooking":
        """Ensures at least one confirmation channel is selected and SMS consent is explicit."""
        if not (self.sendEmailConfirmation or self.sendSmsConfirmation):
            raise ValueError("Select at least one confirmation channel.")

        if self.sendSmsConfirmation and not self.acceptedSmsConsent:
            raise ValueError("SMS confirmations require explicit text-message consent.")

        return self


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
