# Architecture

## Monorepo Layout
- `apps/web`: Next.js application (App Router)
- `apps/api`: FastAPI application
- `data`: JSON storage for local V0
- `docs`: project documentation

## Runtime Flow
1. User browses frontend pages in `apps/web`.
2. Booking form submits intake data to FastAPI.
3. FastAPI persists booking intake to JSON.
4. FastAPI sends email to business owner and client.
5. Frontend redirects user to Setmore booking URL.

## Phase Notes
- SMS confirmation is phase 2.
- Supabase migration comes after local JSON validation.
