#!/usr/bin/env bash
set -euo pipefail

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

echo "[1/5] Updating apt cache..."
$SUDO apt-get update -y

echo "[2/5] Installing base packages..."
$SUDO apt-get install -y ca-certificates curl gnupg lsb-release git

echo "[3/5] Installing Docker engine + compose plugin..."
if ! command -v docker >/dev/null 2>&1; then
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null

  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "[4/5] Enabling docker service..."
$SUDO systemctl enable docker
$SUDO systemctl start docker

echo "[5/5] Adding current user to docker group..."
$SUDO usermod -aG docker "$USER"

echo "Bootstrap complete. Log out and back in (or run 'newgrp docker') before deploying."
