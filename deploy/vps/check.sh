#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${VPS_APP_DIR:-/opt/seo-geo-dashboard}"
cd "$APP_DIR"

if [[ ! -f ".env" ]]; then
  echo "Missing .env at $APP_DIR/.env"
  exit 1
fi

required=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  APP_BASE_URL
  APP_DOMAIN
  PIPELINE_SHARED_SECRET
)

echo "Checking required environment variables..."
for key in "${required[@]}"; do
  if ! grep -q "^${key}=" .env; then
    echo "Missing ${key} in .env"
    exit 1
  fi
done

echo "Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "Checking app health endpoint..."
domain="$(grep '^APP_DOMAIN=' .env | cut -d'=' -f2-)"
curl -fsSL "https://${domain}/api/health" >/dev/null
echo "Health check OK."
