from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json


ROOT_DIR = Path(__file__).resolve().parents[4]
DATA_DIR = ROOT_DIR / "data"
BOOKINGS_FILE = DATA_DIR / "bookings.json"
CONTACTS_FILE = DATA_DIR / "contacts.json"


def _ensure_file(file_path: Path) -> None:
    """Creates missing data file with an empty list payload."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not file_path.exists():
        file_path.write_text("[]", encoding="utf-8")


def _load_records(file_path: Path) -> list[dict]:
    """Loads all records from a JSON file as a list of dictionaries."""
    _ensure_file(file_path)
    return json.loads(file_path.read_text(encoding="utf-8"))


def _save_records(file_path: Path, records: list[dict]) -> None:
    """Writes records to a JSON file with stable formatting."""
    file_path.write_text(json.dumps(records, indent=2), encoding="utf-8")


def append_booking_record(payload: dict) -> None:
    """Appends one booking intake record with server timestamp metadata."""
    records = _load_records(BOOKINGS_FILE)
    records.append(
        {
            "submittedAt": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
    )
    _save_records(BOOKINGS_FILE, records)


def append_contact_record(payload: dict) -> None:
    """Appends one contact message record with server timestamp metadata."""
    records = _load_records(CONTACTS_FILE)
    records.append(
        {
            "submittedAt": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
    )
    _save_records(CONTACTS_FILE, records)
