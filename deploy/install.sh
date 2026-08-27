#!/usr/bin/env bash
# 1-Klick: Scriptwerk als Website auf einem Linux-Homeserver.
# Im Repo:  ./deploy/install.sh
# Optional: BITCOIND_RPC_URL=http://127.0.0.1:8332 BITCOIND_RPC_USER=… BITCOIND_RPC_PASSWORD=… ./deploy/install.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

if ! need_cmd docker; then
  echo "Docker fehlt. Auf Debian/Ubuntu:"
  echo "  curl -fsSL https://get.docker.com | sudo sh"
  echo "  sudo usermod -aG docker \"\$USER\"  &&  neu einloggen"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif need_cmd docker-compose; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose Plugin fehlt (docker compose)."
  exit 1
fi

ENV_FILE="$ROOT/deploy/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT/deploy/.env.example" "$ENV_FILE"
  if [[ -n "${BITCOIND_RPC_URL:-}" ]]; then
    sed -i "s|^BITCOIND_RPC_URL=.*|BITCOIND_RPC_URL=${BITCOIND_RPC_URL}|" "$ENV_FILE"
  fi
  if [[ -n "${BITCOIND_RPC_USER:-}" ]]; then
    sed -i "s|^BITCOIND_RPC_USER=.*|BITCOIND_RPC_USER=${BITCOIND_RPC_USER}|" "$ENV_FILE"
  fi
  if [[ -n "${BITCOIND_RPC_PASSWORD:-}" ]]; then
    sed -i "s|^BITCOIND_RPC_PASSWORD=.*|BITCOIND_RPC_PASSWORD=${BITCOIND_RPC_PASSWORD}|" "$ENV_FILE"
  fi
fi

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$ROOT/deploy/docker-compose.yml" up -d --build

PORT="$(grep -E '^SCRIPTWERK_PORT=' "$ENV_FILE" | cut -d= -f2- || true)"
PORT="${PORT:-8080}"
LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo
echo "Scriptwerk läuft."
echo "  lokal:   http://127.0.0.1:${PORT}"
if [[ -n "${LAN_IP:-}" ]]; then
  echo "  LAN:     http://${LAN_IP}:${PORT}"
fi
echo "  Handy:   dieselbe LAN-Adresse in Chrome → Zum Startbildschirm."
echo "RPC-Proxy: deploy/.env  (BITCOIND_RPC_*)  dann:  ${COMPOSE[*]} -f deploy/docker-compose.yml up -d"
echo "Ohne RPC-Proxy bleibt die Node-Brücke (Skript im Node-Tab) wie bisher."
