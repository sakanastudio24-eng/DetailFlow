# Architecture

## Monorepo Layout
- `apps/web`: Next.js application (App Router)
- `apps/api`: FastAPI application
- `data`: JSON storage for local V0
- `docs`: project documentation

## Runtime Flow
1. User browses frontend pages in `apps/web`.
2. Booking form submits intake data to FastAPI.
3. FastAPI validates channel preferences and persists booking intake to JSON.
4. FastAPI attempts transactional emails via Resend:
5. Owner notification (always, if enabled).
6. Customer confirmation (only when customer email confirmation is selected).
7. FastAPI logs any email delivery errors without blocking booking acceptance.
8. Frontend redirects user to Setmore booking URL.

## Phase Notes
- SMS confirmation is phase 2.
- Supabase migration comes after local JSON validation.
- Email delivery uses hybrid ownership:
- Provider dashboard manages templates and visual content.
- Backend owns send rules, payload mapping, and failure handling.
