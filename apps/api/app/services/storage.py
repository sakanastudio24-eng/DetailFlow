from pathlib import Path
import json


DATA_FILE = Path(__file__).resolve().parents[3] / "data" / "bookings.json"


def load_bookings() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def save_booking(payload: dict) -> None:
    bookings = load_bookings()
    bookings.append(payload)
    DATA_FILE.write_text(json.dumps(bookings, indent=2), encoding="utf-8")
