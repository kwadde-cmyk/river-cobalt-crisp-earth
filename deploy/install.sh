#!/usr/bin/env bash
# Debian / Raspberry Pi: Scriptwerk als Website auf dem Homeserver.
# Bitcoin-Node darf auf einer anderen Maschine liegen (oder später per Brücke).
#
#   ./deploy/install.sh --probe              # nur prüfen
#   ./deploy/install.sh --simulate raspi     # Beispiel-Homeserver
#   ./deploy/install.sh                      # installieren (fragt Port, wenn Terminal)
#   SCRIPTWERK_PORT=8081 BITCOIND_RPC_URL=https://node.local:57521 ./deploy/install.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MODE="install"
SIM=""
for arg in "$@"; do
  case "$arg" in
    --probe) MODE="probe" ;;
    --simulate) SIM="raspi"; MODE="probe" ;;
    --simulate=*) SIM="${arg#*=}"; MODE="probe" ;;
    --help|-h)
      sed -n '2,10p' "$0"
      exit 0
      ;;
  esac
done

need_cmd() { command -v "$1" >/dev/null 2>&1; }

echo "=== Scriptwerk Host-Check ==="
if [[ -n "$SIM" ]]; then
  bash "$ROOT/deploy/probe-host.sh" --simulate "$SIM"
else
  bash "$ROOT/deploy/probe-host.sh"
fi
echo

SUGGEST="$(bash "$ROOT/deploy/probe-host.sh" ${SIM:+--simulate "$SIM"} | awk -F= '/SCRIPTWERK_PORT=/{print $2; exit}')"
SUGGEST="${SUGGEST:-8080}"

if [[ "$MODE" == "probe" ]]; then
  echo "Nur Prüfung. Installation:  ./deploy/install.sh"
  echo "Gewünschter Port:           SCRIPTWERK_PORT=${SUGGEST} ./deploy/install.sh"
  echo "Node woanders, z. B.:       BITCOIND_RPC_URL=https://capable-dosage.local:57521 \\"
  echo "                            BITCOIND_RPC_USER=scriptwerk BITCOIND_RPC_PASSWORD='…' \\"
  echo "                            SCRIPTWERK_PORT=${SUGGEST} ./deploy/install.sh"
  exit 0
fi

PORT="${SCRIPTWERK_PORT:-$SUGGEST}"
if [[ -t 0 && -z "${SCRIPTWERK_PORT:-}" ]]; then
  read -r -p "Port für Scriptwerk [${SUGGEST}]: " typed || true
  PORT="${typed:-$SUGGEST}"
fi

RPC_URL="${BITCOIND_RPC_URL-}"
RPC_USER="${BITCOIND_RPC_USER-}"
RPC_PASS="${BITCOIND_RPC_PASSWORD-}"
if [[ -t 0 && -z "${BITCOIND_RPC_URL+x}" ]]; then
  echo "Bitcoin-Node (optional, darf eine andere Maschine sein)."
  echo "Leer = nur Studio, RPC später per Brücke."
  read -r -p "RPC-URL [leer]: " RPC_URL || true
  if [[ -n "$RPC_URL" ]]; then
    read -r -p "RPC-Nutzer: " RPC_USER || true
    read -r -s -p "RPC-Passwort: " RPC_PASS || true
    echo
  fi
fi

ENV_FILE="$ROOT/deploy/.env"
cat > "$ENV_FILE" <<EOF
SCRIPTWERK_PORT=${PORT}
BITCOIND_RPC_URL=${RPC_URL}
BITCOIND_RPC_USER=${RPC_USER}
BITCOIND_RPC_PASSWORD=${RPC_PASS}
EOF

if need_cmd docker && (docker compose version >/dev/null 2>&1 || need_cmd docker-compose); then
  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  else
    COMPOSE=(docker-compose)
  fi
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$ROOT/deploy/docker-compose.yml" up -d --build
  RUNNER="docker"
elif need_cmd node; then
  echo "Kein Docker — starte mit Node (erstes Mal: npm ci + Build, dauert)."
  if [[ ! -d "$ROOT/node_modules" ]]; then
    npm ci
  fi
  npm run build:host
  PORT="$PORT" HOST=0.0.0.0 BITCOIND_RPC_URL="$RPC_URL" BITCOIND_RPC_USER="$RPC_USER" BITCOIND_RPC_PASSWORD="$RPC_PASS" \
    nohup npm start >>/tmp/scriptwerk.log 2>&1 &
  echo $! >/tmp/scriptwerk.pid
  RUNNER="node"
else
  echo "Weder Docker noch Node gefunden."
  echo "Debian/Raspi, Docker:"
  echo "  curl -fsSL https://get.docker.com | sudo sh"
  echo "  sudo usermod -aG docker \"\$USER\" && neu einloggen"
  echo "Danach erneut: ./deploy/install.sh"
  exit 1
fi

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo
echo "Scriptwerk (${RUNNER}) auf Port ${PORT}"
echo "  lokal:  http://127.0.0.1:${PORT}"
if [[ -n "${LAN_IP:-}" ]]; then
  echo "  LAN:    http://${LAN_IP}:${PORT}"
fi
if [[ -n "$RPC_URL" ]]; then
  echo "  RPC:    ${RPC_URL}  (andere Maschine ist in Ordnung)"
else
  echo "  RPC:    nicht gesetzt — in der UI die Node-Brücke nutzen, Node darf woanders laufen."
fi
echo "  Handy:  LAN-Adresse in Chrome → Zum Startbildschirm."
echo "Nginx-Beispiel falls Port 80 schon ein Webserver ist:  deploy/nginx-scriptwerk.conf"
