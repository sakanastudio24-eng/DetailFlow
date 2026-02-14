# Cruz N Clean V2

Documentation-first rebuild of a car detailing portfolio and booking website.

## Stack
- Frontend: Next.js + TypeScript + React + Tailwind CSS + shadcn-compatible structure
- Backend: FastAPI (minimal API)
- Storage (V0): JSON files (designed for later Supabase migration)

## Current Routes
- `/` Home
- `/services` Multi-vehicle service planner with docking station
- `/booking` Booking intake form (then redirect to Setmore)
- `/contact` Question-only contact form
- `/quote` Quote request form
- `/gallery`
- `/faq`
- `/privacy`
- `/terms`
- `/styleguide` (internal)

## Contact vs Book Now
- `Contact` is for questions only.
- `Book Now` is for appointment intake and Setmore handoff.

## Local Development

### Web
```bash
cd apps/web
npm install
npm run dev
```
Open `http://127.0.0.1:3000`.

### API
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Environment Variables (Web)
- `NEXT_PUBLIC_API_BASE_URL` (default: `http://127.0.0.1:8000`)
- `NEXT_PUBLIC_SETMORE_URL` (default: `https://www.setmore.com`)

See `DEV_GUIDE.md` and `/docs` for architecture and workflow details.
