from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from typing import Any
from urllib import error, request

RESEND_API_URL = "https://api.resend.com/emails"

SERVICE_CATALOG: dict[str, dict[str, Any]] = {
    "pkg-basic": {"name": "Basic Detail", "price": 99},
    "pkg-standard": {"name": "Standard Detail", "price": 189},
    "pkg-premium": {"name": "Premium Detail", "price": 349},
    "addon-ceramic": {"name": "Ceramic Coating", "price": 500},
    "addon-headlight": {"name": "Headlight Restoration", "price": 75},
    "addon-air": {"name": "Air Freshening Treatment", "price": 125},
    "addon-engine": {"name": "Engine Bay Detail", "price": 100},
}


class EmailDeliveryError(RuntimeError):
    """Represents a recoverable outbound email delivery failure."""


def _env_flag(name: str, default: bool) -> bool:
    """Parses a boolean environment flag with a safe default."""
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _sanitize_error(error_text: str) -> str:
    """Normalizes provider error text into a short, log-safe summary."""
    compact = " ".join(error_text.split())
    return compact[:300] if compact else "Unknown email delivery error."


def _extract_recipient(recipient: Any) -> str:
    """Returns the normalized email recipient value for logs."""
    if isinstance(recipient, str):
        return recipient

    return ""


def _build_vehicle_breakdown(vehicles: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    """Builds enriched vehicle rows with service metadata and estimated subtotals."""
    enriched: list[dict[str, Any]] = []
    grand_total = 0

    for vehicle in vehicles:
        service_rows: list[dict[str, Any]] = []
        vehicle_total = 0

        for service_id in vehicle.get("serviceIds", []):
            service_meta = SERVICE_CATALOG.get(service_id, {"name": service_id, "price": 0})
            price = int(service_meta.get("price", 0))
            service_rows.append(
                {
                    "id": service_id,
                    "name": str(service_meta.get("name", service_id)),
                    "price": price,
                }
            )
            vehicle_total += price

        grand_total += vehicle_total
        enriched.append(
            {
                "id": vehicle.get("id", ""),
                "label": vehicle.get("label", "Vehicle"),
                "make": vehicle.get("make", ""),
                "model": vehicle.get("model", ""),
                "year": vehicle.get("year", ""),
                "color": vehicle.get("color", ""),
                "services": service_rows,
                "estimatedSubtotal": vehicle_total,
            }
        )

    return enriched, grand_total


def _build_template_variables(booking_record: dict[str, Any]) -> dict[str, Any]:
    """Builds the structured variable payload used by template and fallback sends."""
    customer = booking_record.get("customer", {})
    vehicles = booking_record.get("vehicles", [])
    enriched_vehicles, grand_total = _build_vehicle_breakdown(vehicles)

    return {
        "booking": {
            "bookingId": booking_record.get("bookingId", "unknown"),
            "submittedAt": booking_record.get("submittedAt", datetime.now(timezone.utc).isoformat()),
        },
        "customer": {
            "fullName": customer.get("fullName", ""),
            "email": customer.get("email", ""),
            "phone": customer.get("phone", ""),
            "zipCode": customer.get("zipCode", ""),
            "notes": customer.get("notes", ""),
        },
        "preferences": {
            "sendEmailConfirmation": bool(customer.get("sendEmailConfirmation", False)),
            "sendSmsConfirmation": bool(customer.get("sendSmsConfirmation", False)),
            "acceptedSmsConsent": bool(customer.get("acceptedSmsConsent", False)),
        },
        "vehicles": enriched_vehicles,
        "estimate": {
            "grandTotal": grand_total,
            "vehicleCount": len(enriched_vehicles),
        },
    }


def _build_owner_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for owner booking notifications."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    estimate = template_variables["estimate"]

    lines = [
        f"Booking ID: {booking['bookingId']}",
        f"Submitted: {booking['submittedAt']}",
        f"Customer: {customer['fullName']}",
        f"Email: {customer['email']}",
        f"Phone: {customer['phone']}",
        f"ZIP: {customer['zipCode']}",
        "",
        "Vehicles:",
    ]

    html_rows: list[str] = []
    for vehicle in vehicles:
        services = ", ".join([f"{service['name']} (${service['price']})" for service in vehicle["services"]])
        services_text = services if services else "No services selected"
        lines.append(
            f"- {vehicle['label']} ({vehicle['year']} {vehicle['make']} {vehicle['model']} {vehicle['color']}): "
            f"{services_text} | Subtotal ${vehicle['estimatedSubtotal']}"
        )
        html_rows.append(
            "<li>"
            f"<strong>{vehicle['label']}</strong> "
            f"({vehicle['year']} {vehicle['make']} {vehicle['model']} {vehicle['color']})"
            f"<br/>Services: {services_text}"
            f"<br/>Subtotal: ${vehicle['estimatedSubtotal']}"
            "</li>"
        )

    lines.append("")
    lines.append(f"Estimated total: ${estimate['grandTotal']}")
    lines.append(f"Notes: {customer['notes'] or 'None'}")

    html = (
        "<h2>New Booking Intake</h2>"
        f"<p><strong>Booking ID:</strong> {booking['bookingId']}<br/>"
        f"<strong>Submitted:</strong> {booking['submittedAt']}</p>"
        f"<p><strong>Customer:</strong> {customer['fullName']}<br/>"
        f"<strong>Email:</strong> {customer['email']}<br/>"
        f"<strong>Phone:</strong> {customer['phone']}<br/>"
        f"<strong>ZIP:</strong> {customer['zipCode']}</p>"
        f"<p><strong>Estimated total:</strong> ${estimate['grandTotal']}</p>"
        f"<p><strong>Notes:</strong> {customer['notes'] or 'None'}</p>"
        f"<ul>{''.join(html_rows)}</ul>"
    )

    return {
        "subject": f"New booking intake {booking['bookingId']}",
        "text": "\n".join(lines),
        "html": html,
    }


def _build_customer_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for customer confirmation emails."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    estimate = template_variables["estimate"]

    lines = [
        f"Hi {customer['fullName']},",
        "",
        "Thanks for submitting your booking details. We received your intake and will review it shortly.",
        f"Booking ID: {booking['bookingId']}",
        f"Submitted: {booking['submittedAt']}",
        "",
        "Vehicle Summary:",
    ]

    html_rows: list[str] = []
    for vehicle in vehicles:
        services = ", ".join([f"{service['name']} (${service['price']})" for service in vehicle["services"]])
        services_text = services if services else "No services selected"
        lines.append(
            f"- {vehicle['label']} ({vehicle['year']} {vehicle['make']} {vehicle['model']} {vehicle['color']}): "
            f"{services_text} | Subtotal ${vehicle['estimatedSubtotal']}"
        )
        html_rows.append(
            "<li>"
            f"<strong>{vehicle['label']}</strong> "
            f"({vehicle['year']} {vehicle['make']} {vehicle['model']} {vehicle['color']})"
            f"<br/>Services: {services_text}"
            f"<br/>Subtotal: ${vehicle['estimatedSubtotal']}"
            "</li>"
        )

    lines.append("")
    lines.append(f"Estimated total: ${estimate['grandTotal']}")
    lines.append("Next step: complete your appointment time in Setmore.")

    html = (
        f"<p>Hi {customer['fullName']},</p>"
        "<p>Thanks for submitting your booking details. "
        "We received your intake and will review it shortly.</p>"
        f"<p><strong>Booking ID:</strong> {booking['bookingId']}<br/>"
        f"<strong>Submitted:</strong> {booking['submittedAt']}</p>"
        f"<p><strong>Estimated total:</strong> ${estimate['grandTotal']}</p>"
        "<p><strong>Vehicle Summary</strong></p>"
        f"<ul>{''.join(html_rows)}</ul>"
        "<p>Next step: complete your appointment time in Setmore.</p>"
    )

    return {
        "subject": f"Booking received: {booking['bookingId']}",
        "text": "\n".join(lines),
        "html": html,
    }


def _post_resend_email(payload: dict[str, Any]) -> None:
    """Sends one email payload to Resend and raises EmailDeliveryError on failure."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        raise EmailDeliveryError("RESEND_API_KEY is not configured.")

    request_body = json.dumps(payload).encode("utf-8")
    req = request.Request(RESEND_API_URL, data=request_body, method="POST")
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", "application/json")

    try:
        with request.urlopen(req, timeout=20) as response:
            if response.status >= 300:
                response_body = response.read().decode("utf-8", errors="ignore")
                raise EmailDeliveryError(_sanitize_error(response_body))
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="ignore")
        raise EmailDeliveryError(_sanitize_error(f"HTTP {exc.code}: {response_body or exc.reason}")) from exc
    except error.URLError as exc:
        raise EmailDeliveryError(_sanitize_error(str(exc.reason))) from exc


def _send_resend_email(
    *,
    to_address: str,
    subject: str,
    template_id: str,
    template_variables: dict[str, Any],
    fallback_html: str,
    fallback_text: str,
) -> None:
    """Sends via provider template when configured and falls back to inline HTML/text."""
    from_address = os.getenv("EMAIL_FROM", "").strip()
    if not from_address:
        raise EmailDeliveryError("EMAIL_FROM is not configured.")

    reply_to = os.getenv("EMAIL_REPLY_TO", from_address).strip()
    base_payload = {
        "from": from_address,
        "to": [to_address],
        "reply_to": reply_to,
        "subject": subject,
    }

    template_attempt_errors: list[str] = []
    if template_id:
        template_payload_options = [
            {**base_payload, "template_id": template_id, "variables": template_variables},
            {**base_payload, "template_id": template_id, "template_data": template_variables},
            {**base_payload, "templateId": template_id, "variables": template_variables},
        ]

        for candidate in template_payload_options:
            try:
                _post_resend_email(candidate)
                return
            except EmailDeliveryError as exc:
                template_attempt_errors.append(str(exc))

    try:
        _post_resend_email(
            {
                **base_payload,
                "html": fallback_html,
                "text": fallback_text,
            }
        )
    except EmailDeliveryError as exc:
        if template_attempt_errors:
            template_error = _sanitize_error(" | ".join(template_attempt_errors))
            raise EmailDeliveryError(
                f"Template send failed ({template_error}); fallback send failed ({_sanitize_error(str(exc))})."
            ) from exc

        raise


def send_owner_notification_email(booking_record: dict[str, Any]) -> None:
    """Sends owner booking notifications using the configured provider/template path."""
    owner_email = os.getenv("BOOKING_OWNER_EMAIL", "").strip()
    if not owner_email:
        raise EmailDeliveryError("BOOKING_OWNER_EMAIL is not configured.")

    template_variables = _build_template_variables(booking_record)
    fallback_content = _build_owner_fallback_content(template_variables)
    template_id = os.getenv("RESEND_TEMPLATE_OWNER_NOTIFICATION", "").strip()

    _send_resend_email(
        to_address=owner_email,
        subject=fallback_content["subject"],
        template_id=template_id,
        template_variables=template_variables,
        fallback_html=fallback_content["html"],
        fallback_text=fallback_content["text"],
    )


def send_customer_confirmation_email(booking_record: dict[str, Any]) -> None:
    """Sends customer booking confirmations using the configured provider/template path."""
    customer = booking_record.get("customer", {})
    customer_email = _extract_recipient(customer.get("email"))
    if not customer_email:
        raise EmailDeliveryError("Customer email is missing from booking payload.")

    template_variables = _build_template_variables(booking_record)
    fallback_content = _build_customer_fallback_content(template_variables)
    template_id = os.getenv("RESEND_TEMPLATE_CUSTOMER_CONFIRMATION", "").strip()

    _send_resend_email(
        to_address=customer_email,
        subject=fallback_content["subject"],
        template_id=template_id,
        template_variables=template_variables,
        fallback_html=fallback_content["html"],
        fallback_text=fallback_content["text"],
    )


def _build_failure_payload(
    *,
    booking_id: str,
    recipient_role: str,
    recipient: str,
    provider: str,
    error_summary: str,
) -> dict[str, str]:
    """Builds one normalized failure log payload row."""
    return {
        "bookingId": booking_id,
        "recipientRole": recipient_role,
        "provider": provider,
        "to": recipient,
        "errorSummary": _sanitize_error(error_summary),
        "retryStatus": "pending",
    }


def send_booking_transactional_emails(booking_record: dict[str, Any]) -> list[dict[str, str]]:
    """Runs owner/customer transactional sends and returns failure rows for persistence."""
    provider = os.getenv("EMAIL_PROVIDER", "resend").strip().lower()
    booking_id = str(booking_record.get("bookingId", "unknown"))
    customer = booking_record.get("customer", {})

    owner_enabled = _env_flag("EMAIL_OWNER_ENABLED", default=True)
    customer_enabled = _env_flag("EMAIL_CUSTOMER_ENABLED", default=True)
    customer_requested_email = bool(customer.get("sendEmailConfirmation", False))

    failures: list[dict[str, str]] = []

    if provider != "resend":
        error_summary = f"Unsupported EMAIL_PROVIDER '{provider}'."
        if owner_enabled:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="owner",
                    recipient=os.getenv("BOOKING_OWNER_EMAIL", "").strip(),
                    provider=provider,
                    error_summary=error_summary,
                )
            )

        if customer_enabled and customer_requested_email:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="customer",
                    recipient=_extract_recipient(customer.get("email")),
                    provider=provider,
                    error_summary=error_summary,
                )
            )

        return failures

    if owner_enabled:
        try:
            send_owner_notification_email(booking_record)
        except EmailDeliveryError as exc:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="owner",
                    recipient=os.getenv("BOOKING_OWNER_EMAIL", "").strip(),
                    provider=provider,
                    error_summary=str(exc),
                )
            )

    if customer_enabled and customer_requested_email:
        try:
            send_customer_confirmation_email(booking_record)
        except EmailDeliveryError as exc:
            failures.append(
                _build_failure_payload(
                    booking_id=booking_id,
                    recipient_role="customer",
                    recipient=_extract_recipient(customer.get("email")),
                    provider=provider,
                    error_summary=str(exc),
                )
            )

    return failures
