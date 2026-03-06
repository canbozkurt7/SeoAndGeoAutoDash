#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${VPS_APP_DIR:-/opt/seo-geo-dashboard}"
BRANCH="${1:-main}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Application not found at $APP_DIR. Run deploy.sh first."
  exit 1
fi

cd "$APP_DIR"

if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "Remote branch '$BRANCH' not found, deploying local branch '$BRANCH'."
    git checkout "$BRANCH"
  else
    echo "Branch '$BRANCH' not found on remote or locally."
    exit 1
  fi
fi

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
