from __future__ import annotations

from datetime import datetime, timezone
from html import escape
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


def _parse_submitted_timestamp(submitted_at: str) -> datetime:
    """Parses booking timestamps and returns a timezone-aware datetime."""
    try:
        normalized = submitted_at.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)

        return parsed
    except ValueError:
        return datetime.now(timezone.utc)


def _format_booking_date_label(submitted_at: str) -> str:
    """Formats a submitted timestamp into a month/day owner subject label."""
    submitted_dt = _parse_submitted_timestamp(submitted_at)
    return f"{submitted_dt.strftime('%B')} {submitted_dt.day}"


def _format_booking_datetime_label(submitted_at: str) -> str:
    """Formats a submitted timestamp with explicit timezone context."""
    submitted_dt = _parse_submitted_timestamp(submitted_at)
    timezone_label = submitted_dt.tzname() or "UTC"
    return f"{submitted_dt.strftime('%B')} {submitted_dt.day}, {submitted_dt.year} at {submitted_dt.strftime('%I:%M %p')} ({timezone_label})"


def _build_owner_manage_link(booking_id: str) -> str:
    """Builds an optional owner-manage URL from environment config."""
    base_url = os.getenv("OWNER_BOOKING_MANAGE_URL", "").strip()
    if not base_url:
        return ""

    if "{booking_id}" in base_url:
        return base_url.replace("{booking_id}", booking_id)

    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}bookingId={booking_id}"


def _build_owner_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for owner booking notifications."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    booking_id = str(booking["bookingId"])
    submitted_at = str(booking["submittedAt"])
    submitted_datetime = _format_booking_datetime_label(submitted_at)
    submitted_date = _format_booking_date_label(submitted_at)
    manage_link = _build_owner_manage_link(booking_id)
    notes = customer["notes"] or "None"

    services_flat: list[dict[str, Any]] = []
    receipt_rows: list[str] = []
    for vehicle in vehicles:
        vehicle_name = f"{vehicle['year']} {vehicle['make']} {vehicle['model']} ({vehicle['color']})".strip()
        for service in vehicle["services"]:
            services_flat.append(service)
            receipt_rows.append(
                "<tr>"
                f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#10150f;font-size:13px;'>{escape(vehicle['label'])} - {escape(vehicle_name)} - {escape(service['name'])}</td>"
                f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#10150f;font-size:13px;text-align:right;'>${int(service['price'])}</td>"
                "</tr>"
            )

    primary_service = next(
        (service["name"] for service in services_flat if str(service["id"]).startswith("pkg-")),
        services_flat[0]["name"] if services_flat else "Detail",
    )
    service_summary = ", ".join([str(service["name"]) for service in services_flat]) if services_flat else "No services selected"

    if not receipt_rows:
        receipt_rows.append(
            "<tr><td style='padding:8px;color:#10150f;font-size:13px;' colspan='2'>No services selected.</td></tr>"
        )

    lines = [
        f"New Booking Confirmed — {primary_service} — {submitted_date}",
        "",
        f"Customer name: {customer['fullName']}",
        f"Phone: {customer['phone']}",
        f"Email: {customer['email']}",
        f"Service: {service_summary}",
        f"Date/time (timezone): {submitted_datetime}",
        f"Notes: {notes}",
        f"Booking ID: {booking_id}",
        f"Manage link: {manage_link or 'Not available'}",
        "",
        "This owner notification is sent after booking confirmation.",
    ]

    manage_link_html = (
        "<p style='margin:12px 0 0 0;font-size:13px;'>"
        f"<a href='{escape(manage_link)}' style='color:#7f0912;font-weight:700;text-decoration:none;'>Manage Booking</a>"
        "</p>"
        if manage_link
        else "<p style='margin:12px 0 0 0;font-size:13px;color:#6b7280;'>Manage link: Not available</p>"
    )

    html = (
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#10150f;'>"
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>"
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>"
        "<div style='background:#10150f;padding:16px 20px;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr>"
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruzn <span style='color:#8cc0d6;'>Clean</span></td>"
        "<td style='text-align:right;font-size:12px;'>"
        "<span style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Owner Alert</span>"
        "</td>"
        "</tr>"
        "</table>"
        "</div>"
        "<div style='padding:20px;'>"
        f"<p style='margin:0;font-size:23px;font-weight:800;color:#7f0912;'>New Booking Confirmed — {escape(primary_service)} — {escape(submitted_date)}</p>"
        "<p style='margin:8px 0 0 0;font-size:13px;color:#374151;'>This owner notification is sent after booking confirmation.</p>"
        "<div style='margin-top:16px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Customer name</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>{escape(customer['fullName'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Phone</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(customer['phone'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Email</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(customer['email'])}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Service</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(service_summary)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Date/time (timezone)</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(submitted_datetime)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Notes</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{escape(notes)}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Booking ID</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;color:#7f0912;font-weight:700;'>{escape(booking_id)}</td></tr>"
        "</table>"
        "</div>"
        "<div style='margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;'>Service Line</td>"
        "<td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;text-align:right;'>Cost</td></tr>"
        f"{''.join(receipt_rows)}"
        "</table>"
        "</div>"
        f"{manage_link_html}"
        "</div>"
        "</div>"
        "</div>"
        "</div>"
    )

    return {
        "subject": f"New Booking Confirmed — {primary_service} — {submitted_date}",
        "text": "\n".join(lines),
        "html": html,
    }


def _build_customer_fallback_content(template_variables: dict[str, Any]) -> dict[str, str]:
    """Builds fallback HTML/text content for customer confirmation emails."""
    booking = template_variables["booking"]
    customer = template_variables["customer"]
    vehicles = template_variables["vehicles"]
    estimate = template_variables["estimate"]
    site_url = os.getenv("PUBLIC_SITE_URL", "https://www.cruznclean.com").rstrip("/")
    terms_link = f"{site_url}/terms"
    readiness_link = f"{site_url}/faq"
    support_email = os.getenv("EMAIL_REPLY_TO", os.getenv("EMAIL_FROM", "support@cruznclean.com")).strip()
    support_phone = "(555) 123-4567"
    address_value = customer.get("address") or customer.get("zipCode") or "Address to be confirmed"

    service_charge_total = 0
    other_services_total = 0
    other_services: list[str] = []
    receipt_rows: list[str] = []

    for vehicle in vehicles:
        vehicle_name = f"{vehicle['year']} {vehicle['make']} {vehicle['model']} ({vehicle['color']})".strip()
        for service in vehicle["services"]:
            price = int(service["price"])
            receipt_rows.append(
                "<tr>"
                f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#10150f;font-size:13px;'>{vehicle['label']} - {vehicle_name} - {service['name']}</td>"
                f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;color:#10150f;font-size:13px;text-align:right;'>${price}</td>"
                "</tr>"
            )
            if str(service["id"]).startswith("pkg-"):
                service_charge_total += price
            else:
                other_services_total += price
                other_services.append(service["name"])

    if not receipt_rows:
        receipt_rows.append(
            "<tr><td style='padding:8px;color:#10150f;font-size:13px;' colspan='2'>No services selected.</td></tr>"
        )

    other_services_text = ", ".join(other_services) if other_services else "None"
    total_amount = int(estimate["grandTotal"])
    deposit_due = round(total_amount * 0.5, 2)

    lines = [
        "Cruzn Clean order comfermation",
        "",
        f"Order number: {booking['bookingId']}",
        f"Order name: {customer['fullName']}",
        "",
        "THANK YOU ✓",
        "Your receipt:",
        f"Name: {customer['fullName']}",
        f"Address: {address_value}",
        f"Number: {customer['phone']}",
        f"Service charge cost: ${service_charge_total}",
        f"Other services: {other_services_text} (${other_services_total})",
        f"Total amount due: ${total_amount}",
        f"Payment info: 50% deposit on sight (${deposit_due}) and 50% on completion (${deposit_due})",
        f"Terms and service readiness: {terms_link} | {readiness_link}",
        f"For inquiries call/email: {support_phone} | {support_email}",
    ]

    html = (
        "<div style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#10150f;'>"
        "<div style='max-width:700px;margin:0 auto;padding:24px 16px;'>"
        "<div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;'>"
        "<div style='background:#10150f;padding:16px 20px;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr>"
        "<td style='color:#ffffff;font-size:22px;font-weight:700;'>Cruzn <span style='color:#8cc0d6;'>Clean</span></td>"
        "<td style='text-align:right;font-size:12px;'>"
        f"<a href='{site_url}' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Home</a>"
        f"<a href='{site_url}/services' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Services</a>"
        f"<a href='{site_url}/booking' style='color:#e5e7eb;text-decoration:none;margin-left:12px;'>Book</a>"
        "</td>"
        "</tr>"
        "</table>"
        "</div>"
        "<div style='padding:20px;'>"
        "<p style='margin:0;font-size:12px;color:#6b7280;'>Order Number</p>"
        f"<p style='margin:4px 0 0 0;font-size:16px;font-weight:700;color:#7f0912;'>{booking['bookingId']}</p>"
        f"<p style='margin:4px 0 0 0;font-size:13px;color:#374151;'>Order Name: {customer['fullName']}</p>"
        "<div style='margin-top:18px;padding:14px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;'>"
        "<p style='margin:0;font-size:28px;font-weight:800;color:#166534;'>THANK YOU ✓</p>"
        "<p style='margin:6px 0 0 0;font-size:13px;color:#166534;'>Your booking intake has been confirmed.</p>"
        "</div>"
        "<h2 style='margin:18px 0 8px 0;font-size:18px;color:#10150f;'>Receipt</h2>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:8px;background:#f9fafb;font-weight:700;font-size:13px;'>Name</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>{customer['fullName']}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Address</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{address_value}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-weight:700;font-size:13px;'>Number</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>{customer['phone']}</td></tr>"
        "</table>"
        "<div style='margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>"
        "<tr><td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;'>Service</td>"
        "<td style='padding:10px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;text-align:right;'>Cost</td></tr>"
        f"{''.join(receipt_rows)}"
        "<tr><td style='padding:8px;background:#f9fafb;font-size:13px;font-weight:700;'>Service charge cost</td>"
        f"<td style='padding:8px;background:#f9fafb;font-size:13px;text-align:right;'>${service_charge_total}</td></tr>"
        "<tr><td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;font-weight:700;'>Other services</td>"
        f"<td style='padding:8px;border-top:1px solid #e5e7eb;font-size:13px;text-align:right;'>${other_services_total}</td></tr>"
        "<tr><td style='padding:10px;background:#7f0912;color:#ffffff;font-size:14px;font-weight:800;'>Total amount due</td>"
        f"<td style='padding:10px;background:#7f0912;color:#ffffff;font-size:14px;font-weight:800;text-align:right;'>${total_amount}</td></tr>"
        "</table>"
        "</div>"
        "<div style='margin-top:14px;padding:12px;border:1px solid #fecaca;background:#fff1f2;border-radius:10px;'>"
        "<p style='margin:0;font-size:13px;font-weight:700;color:#7f0912;'>Payment info</p>"
        f"<p style='margin:6px 0 0 0;font-size:13px;color:#7f0912;'>Payment will be concluded by a 50%deposite on sight (${deposit_due}) and 50% deposite on compleation (${deposit_due}).</p>"
        "</div>"
        "<p style='margin:14px 0 0 0;font-size:13px;'>"
        f"<a href='{terms_link}' style='color:#7f0912;font-weight:700;text-decoration:none;'>Terms & Conditions</a> | "
        f"<a href='{readiness_link}' style='color:#7f0912;font-weight:700;text-decoration:none;'>Service Readiness</a>"
        "</p>"
        f"<p style='margin:10px 0 0 0;font-size:13px;color:#374151;'>For any inquiries call/email: {support_phone} | {support_email}</p>"
        "</div>"
        "</div>"
        "</div>"
        "</div>"
    )

    return {
        "subject": "Cruzn Clean order comfermation",
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

    customer_enabled = _env_flag("EMAIL_CUSTOMER_ENABLED", default=True)
    customer_requested_email = bool(customer.get("sendEmailConfirmation", False))

    failures: list[dict[str, str]] = []

    if provider != "resend":
        error_summary = f"Unsupported EMAIL_PROVIDER '{provider}'."
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
