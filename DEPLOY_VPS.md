# Hostinger VPS Deployment Runbook (Private GitHub + Auto Deploy)

## Prerequisites
- Hostinger Ubuntu VPS with SSH access.
- Private GitHub repository.
- Domain/subdomain A record pointed to VPS IP (example: `dashboard.yourdomain.com`).

## First-time setup on VPS

### 1) Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2) Install git
```bash
apt-get update -y
apt-get install -y git
```

### 3) Configure VPS key for private GitHub repo (deploy key)
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -C "hostinger-repo-deploy-key" -f ~/.ssh/github_repo_deploy -N ""
cat ~/.ssh/github_repo_deploy.pub
```
- Copy the output and add it in GitHub repository:
  - `Settings` -> `Deploy keys` -> `Add deploy key`
  - Enable `Allow write access`: `OFF` (read-only).

Create SSH config so VPS always uses this key:
```bash
cat > ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_repo_deploy
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
EOF
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

### 4) Clone repository
```bash
git clone git@github.com:YOUR_USER/YOUR_PRIVATE_REPO.git /opt/seo-geo-dashboard
cd /opt/seo-geo-dashboard
chmod +x deploy/vps/*.sh
```

### 5) Install Docker and Compose plugin
```bash
cd /opt/seo-geo-dashboard
bash deploy/vps/bootstrap-ubuntu.sh
newgrp docker
```

### 6) Create production `.env`
```bash
cd /opt/seo-geo-dashboard
cp .env.example .env
nano .env
```
Required keys at minimum:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL` (example `https://dashboard.yourdomain.com`)
- `APP_DOMAIN` (example `dashboard.yourdomain.com`)
- `PIPELINE_SHARED_SECRET`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `PERPLEXITY_API_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL_FROM`

### 7) First deploy (manual)
```bash
cd /opt/seo-geo-dashboard
bash deploy/vps/deploy.sh git@github.com:YOUR_USER/YOUR_PRIVATE_REPO.git main
```

### 8) Health check
```bash
cd /opt/seo-geo-dashboard
bash deploy/vps/check.sh
curl -I https://dashboard.yourdomain.com/api/health
```

## Auto Deploy (GitHub Actions -> VPS)

### 1) Prepare SSH key for GitHub Actions to access VPS
Run on VPS:
```bash
ssh-keygen -t ed25519 -C "github-actions-vps" -f ~/.ssh/github_actions_vps -N ""
cat ~/.ssh/github_actions_vps.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_actions_vps
```
Copy the private key output (`~/.ssh/github_actions_vps`) and store in GitHub secret `VPS_SSH_KEY`.

### 2) Add GitHub Actions secrets
GitHub repo -> `Settings` -> `Secrets and variables` -> `Actions`:
- `VPS_HOST` = VPS public IP or domain
- `VPS_PORT` = `22`
- `VPS_USER` = SSH user (example `root`)
- `VPS_SSH_KEY` = private key content from `~/.ssh/github_actions_vps`
- `VPS_APP_DIR` = `/opt/seo-geo-dashboard`

Workflow file already exists at `.github/workflows/deploy.yml`.
Every push to `main` triggers auto deploy.

## Later deployments
- Push to `main` -> auto deploy starts.
- Manual trigger from GitHub Actions UI: `Deploy to Hostinger VPS` -> `Run workflow`.
- Manual server-side deploy fallback:
```bash
cd /opt/seo-geo-dashboard
bash deploy/vps/update.sh main
```

## Supabase one-time tasks
- Run migration in SQL Editor: `supabase/migrations/001_init.sql`.
- Deploy functions: `run_daily_pipeline`, `flush_email_queue`.
- Set function env vars:
  - `APP_BASE_URL`
  - `PIPELINE_SHARED_SECRET`
  - `DEFAULT_SITE_ID`
- Add schedules:
  - Daily: `run_daily_pipeline`
  - Every 5-15 min: `flush_email_queue`

## Troubleshooting runbook
```bash
cd /opt/seo-geo-dashboard
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200
bash deploy/vps/check.sh
```

### Rollback (quick)
```bash
cd /opt/seo-geo-dashboard
git log --oneline -n 5
RB="rollback-$(date +%Y%m%d%H%M)"
git checkout -b "$RB" <GOOD_COMMIT_SHA>
bash deploy/vps/update.sh "$RB"
```
Then return to main when ready:
```bash
git checkout main
git pull --ff-only origin main
```
