#!/usr/bin/env bash
# Host-Check für Debian/Raspi: Webserver, Ports, Vorschlag für Scriptwerk.
#   ./deploy/probe-host.sh
#   ./deploy/probe-host.sh --simulate raspi
set -euo pipefail

SIM="${SIMULATE:-}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --simulate) SIM="${2:-raspi}"; shift 2 ;;
    --simulate=*) SIM="${1#*=}"; shift ;;
    *) shift ;;
  esac
done

CANDIDATES=(8080 8081 8090 8787 3000 8888 80)
SCAN=(22 80 443 3000 8080 8081 8090 8332 18332 57521 8787 8888)

has_cmd() { command -v "$1" >/dev/null 2>&1; }

port_busy() {
  local p="$1"
  python3 - "$p" <<'PY' 2>/dev/null
import socket, sys
p = int(sys.argv[1])
s = socket.socket()
s.settimeout(0.25)
try:
    raise SystemExit(0 if s.connect_ex(("127.0.0.1", p)) == 0 else 1)
finally:
    s.close()
PY
}

svc_active() {
  local n="$1"
  has_cmd systemctl && systemctl is-active --quiet "$n" 2>/dev/null
}

pkg_installed() {
  has_cmd dpkg-query && dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q "install ok installed"
}

OS_ID="unknown"
OS_VER=""
if [[ -f /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_ID="${ID:-unknown}"
  OS_VER="${VERSION_ID:-}"
fi
ARCH="$(uname -m)"
MODEL=""
if [[ -f /proc/device-tree/model ]]; then
  MODEL="$(tr -d '\0' </proc/device-tree/model)"
fi
PI=0
if [[ "$ARCH" == arm* || "$ARCH" == aarch64 ]] || [[ "$MODEL" == *Raspberry* ]]; then
  PI=1
fi

WEBS=()
seen_web=""
for pair in nginx:nginx apache2:apache2 apache2:httpd caddy:caddy lighttpd:lighttpd; do
  svc="${pair%%:*}"; bin="${pair##*:}"
  if svc_active "$svc" || has_cmd "$bin" || pkg_installed "$svc" || [[ -d "/etc/$svc" ]]; then
    case " $seen_web " in
      *" $svc "*) ;;
      *)
        WEBS+=("$svc")
        seen_web+=" $svc"
        ;;
    esac
  fi
done

BUSY=()
FREE=()
for p in "${SCAN[@]}"; do
  if port_busy "$p"; then BUSY+=("$p"); else FREE+=("$p"); fi
done

if [[ -n "$SIM" ]]; then
  case "$SIM" in
    raspi|raspi-nginx)
      PI=1
      ARCH="aarch64"
      MODEL="Raspberry Pi 5 (Simulation)"
      OS_ID="debian"
      OS_VER="12"
      WEBS=(nginx)
      BUSY=(22 80 443)
      FREE=(3000 8080 8081 8090 8332 18332 57521 8787 8888)
      ;;
    debian-busy)
      WEBS=(nginx apache2)
      BUSY=(22 80 443 8080 8332)
      FREE=(8081 8090 8787 3000 8888)
      MODEL="Homeserver (Simulation)"
      ;;
    *)
      echo "Unbekanntes Profil: $SIM  (raspi | debian-busy)" >&2
      exit 2
      ;;
  esac
fi

SUGGEST=""
for p in "${CANDIDATES[@]}"; do
  skip=0
  for b in "${BUSY[@]+"${BUSY[@]}"}"; do
    [[ "$b" == "$p" ]] && skip=1 && break
  done
  if [[ $skip -eq 0 ]]; then
    if [[ "$p" == "80" && ${#WEBS[@]} -gt 0 ]]; then
      continue
    fi
    SUGGEST="$p"
    break
  fi
done
SUGGEST="${SUGGEST:-8081}"

echo "Maschine"
echo "  OS:      ${OS_ID} ${OS_VER}  (${ARCH})"
echo "  Modell:  ${MODEL:-PC / VM}"
echo "  Raspi:   $([[ $PI -eq 1 ]] && echo ja || echo nein)"
echo "  Node:    $(has_cmd node && node -v || echo fehlt)"
echo "  Docker:  $(has_cmd docker && echo ja || echo fehlt)"
echo
echo "Webserver"
if [[ ${#WEBS[@]} -eq 0 ]]; then
  echo "  keiner erkannt — Scriptwerk kann einen eigenen Port nehmen."
else
  echo "  erkannt: ${WEBS[*]}"
  echo "  Port 80/443 nicht anfassen. Optional Nginx als Reverse-Proxy:"
  echo "    deploy/nginx-scriptwerk.conf → sites-enabled, proxy auf den Scriptwerk-Port."
fi
echo
echo "Ports  (belegt / frei)"
echo "  belegt: ${BUSY[*]:-—}"
echo "  frei:   ${FREE[*]:-—}"
echo
echo "Vorschlag"
echo "  SCRIPTWERK_PORT=${SUGGEST}"
echo "  Bitcoin-Node muss nicht auf dieser Maschine sein."
echo "  Remote-RPC z. B.  BITCOIND_RPC_URL=https://node.local:57521"
echo "  Leer lassen = nur UI, Verbindung per Node-Brücke vom Browser."

if [[ -n "$SIM" ]]; then
  echo
  echo "(Simulation: $SIM)"
fi
