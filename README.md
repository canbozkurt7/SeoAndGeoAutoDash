# SEO + GEO Automation Dashboard MVP

Production-ready MVP scaffold for single-site SEO and LLM visibility monitoring:
- Daily SEO ingestion (GSC/GA4 integration hook)
- GEO citation tracking (ChatGPT, Perplexity, Gemini adapters)
- Daily scoring, alert generation, and run logs
- Dashboard pages: Overview, Prompt Tracking, Alerts, Settings
- Supabase-backed auth/database/jobs + Hostinger VPS deploy target

## Stack
- Next.js (App Router, TypeScript)
- Supabase (Auth, Postgres, RLS, Edge Function scheduling target)
- Vitest (core pipeline/provider/scoring tests)

## Implemented API Endpoints
- `POST /api/integrations/google/connect`
- `POST /api/prompts/import-csv`
- `GET /api/dashboard/overview?range=7d|30d`
- `GET /api/prompts/:id/history`
- `POST /api/alerts/test`
- `POST /api/pipeline/run` (manual/internal trigger)

## Local Setup
1. Install Node.js 22+.
2. Copy `.env.example` to `.env` and fill values.
3. Install deps: `npm install`
4. Run dev server: `npm run dev`

## Supabase Setup
1. Create a Supabase project.
2. Run migration in `supabase/migrations/001_init.sql`.
   - New users are auto-bootstrapped with one default site + owner membership.
3. Deploy edge function:
   - `supabase functions deploy run_daily_pipeline`
   - `supabase functions deploy flush_email_queue`
4. Configure function env vars:
   - `APP_BASE_URL`
   - `PIPELINE_SHARED_SECRET`
   - `DEFAULT_SITE_ID`
5. Create a daily scheduled invocation for `run_daily_pipeline` in Supabase dashboard.
6. Create a frequent schedule (e.g. every 5-15 minutes) for `flush_email_queue`.

## Hostinger VPS Deployment
1. Use private GitHub repo SSH URL on VPS: `git@github.com:<owner>/<repo>.git`.
2. Complete first-time setup with scripts:
   - `deploy/vps/bootstrap-ubuntu.sh`
   - `deploy/vps/deploy.sh <ssh_repo_url> main`
3. Configure GitHub Actions secrets (`VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR`).
4. Auto deploy is handled by `.github/workflows/deploy.yml` on push to `main`.
5. Caddy reverse proxy is included in `docker-compose.prod.yml`.
6. Full step-by-step guide: `DEPLOY_VPS.md`.

## Testing
- `npm run test`

Includes tests for:
- Google token refresh failure handling
- LLM response normalization
- Deterministic GEO score computation
- Partial-failure pipeline behavior and logging paths
