#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <repo_url> [branch]"
  echo "Example: $0 git@github.com:your-user/your-private-repo.git main"
  exit 1
fi

REPO_URL="$1"
BRANCH="${2:-main}"
APP_DIR="${VPS_APP_DIR:-/opt/seo-geo-dashboard}"

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

if [[ "$REPO_URL" != git@github.com:* ]]; then
  echo "Warning: for private repos, use SSH URL format: git@github.com:<owner>/<repo>.git"
fi

echo "[1/4] Cloning or updating repository..."
if [[ ! -d "$APP_DIR/.git" ]]; then
  $SUDO mkdir -p "$APP_DIR"
  $SUDO chown -R "$USER":"$USER" "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

cd "$APP_DIR"

if [[ ! -f ".env" ]]; then
  echo "Missing .env in $APP_DIR. Copy .env.example to .env and fill production values."
  exit 1
fi

echo "[2/4] Building containers..."
docker compose -f docker-compose.prod.yml build --pull

echo "[3/4] Starting stack..."
docker compose -f docker-compose.prod.yml up -d

echo "[4/4] Deployment status:"
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100

echo "Deployment complete."
