# Scriptwerk

Studio for Bitcoin miniscript wallets: build a policy in stages, inspect the descriptor and checksum, assign keys (master / child), check it against Bitcoin Core, register it on Ledger or BitBox.

Desktop and mobile, English / German. The Bitcoin node may live on another machine.

## Features

- **Easy / Expert** — toggle in the header; Easy is the default. Expert adds the **Expert** tab (desktop and mobile): max relative timelock, structure, key reuse, miniscript operators. Easy hides that tab and the extra stage options.
- **Stages** — k-of-n, relative timelock (`older` / CSV), keys that must always co-sign (`A + (B or C)`), several recovery stages
- **Timelock ceiling (Expert)** — 65534 (default, Nunchuk-compatible) or 65535 (Bitcoin maximum). Nunchuk rejects 65535.
- **Structure (Expert)** — late or early first in the descriptor (same paths, different checksum)
- **pk / pkh and 2-of-2 (Expert)** — per stage `pk` or `pkh`; 2-of-2 as `multi` or `and_v`
- **Policy tree** — zoom; tapping a stage highlights its branch
- **Keys** — name, fingerprint, A Master / A1 Child kept separate; import via text, QR, file, USB. Each key shows used / unused; **Delete unused** button
- **Key reuse (Expert)** — Off: one fingerprint = one signing slot; import child keys A1, A2, … On: the same xpub with an incrementing derivation in several stages
- **Checksums (Expert)** — key order and derivation `0/*` vs `<0;1>/*`; search for a known checksum
- **Import / Export** — descriptor, miniscript, BSMS, Scriptwerk JSON, `scriptwerk.keys.txt` (names), BIP-388 for Ledger and BitBox (QR, file, USB). Files carry key names; QR stays comment-free.
- **Bitcoin Core** — `getdescriptorinfo` via host proxy or node bridge. On StartOS: optional dependency; Scriptwerk creates RPC user `scriptwerk_xxxx` itself
- **Hardware** — Ledger Bitcoin app and BitBox02 (WebHID), demo without a device
- **Self-host** — one script for Debian / Raspberry Pi (Docker or Node)
- **StartOS** — wrapper in `deploy/startos`, sideload the `.s9pk` or Community Registry

## Requirements

- Debian or Raspberry Pi OS (or Linux with Docker **or** Node)
- Optional: Bitcoin Core on the LAN (StartOS, your own node). Not required just to design.
- Browser: Chrome or Edge for USB and camera

## Install

```bash
git clone https://github.com/kwadde-cmyk/scriptwerk-startos.git
cd scriptwerk-startos
./deploy/install.sh --probe
./deploy/install.sh
```

`--probe` prints OS, occupied ports, and a port suggestion. Without `SCRIPTWERK_PORT` the script asks in the terminal.

Then e.g. `http://127.0.0.1:8081` or `http://<Pi-IP>:8081`.

Without Docker: `npm ci` + Node. Without either, the script aborts and names the Docker install.

## Update

```bash
cd scriptwerk-startos
git pull
SCRIPTWERK_PORT=8081 ./deploy/install.sh
```

Port and RPC live in `deploy/.env` (overwritten on install). Pass the same port as before.

Stop (Docker):

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

Node start: PID in `/tmp/scriptwerk.pid`, log `/tmp/scriptwerk.log`.

## Parameters

| Variable / flag | Meaning |
|---|---|
| `SCRIPTWERK_PORT` | HTTP port. Default from `--probe` (often 8081 if 80/8080 are taken). |
| `BITCOIND_RPC_URL` | Node RPC, including on another machine. Empty = UI only, connect via the bridge. |
| `BITCOIND_RPC_USER` | RPC user |
| `BITCOIND_RPC_PASSWORD` | RPC password |
| `--probe` | Check the host only, do not install |
| `--dry-run` | Show port/RPC, do not start |
| `--simulate raspi` | Probe with a sample Pi |
| `--help` | Short help |

Example remote node (StartOS):

```bash
SCRIPTWERK_PORT=8081 \
BITCOIND_RPC_URL=https://node.local:57521 \
BITCOIND_RPC_USER=scriptwerk \
BITCOIND_RPC_PASSWORD='…' \
./deploy/install.sh
```

## Node without direct RPC

In the UI: **Node → Bridge**. Keep the bookmarklet/tab open on the node; Core speaks POST only. GET errors in the diagnosis are normal.

StartOS: Bitcoin Core → Interfaces → RPC LAN address (`.local` + https). Trust the root CA in the browser, then create an RPC user.

## Browser on LAN (http, no HTTPS)

Edge/Chrome do not treat `http://192.168.x.x:8081` as secure (USB, camera, LAN).

1. `edge://flags/#unsafely-treat-insecure-origin-as-secure` (Chrome: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`)
2. Enable, add origin: `http://<Pi-IP>:8081`
3. Restart the browser, allow local network

Or SSH tunnel: `ssh -L 8081:127.0.0.1:8081 pi@pi4` → `http://127.0.0.1:8081`

## Nginx in front

If 80/443 already run a web server, leave Scriptwerk on 8081 and use `deploy/nginx-scriptwerk.conf` as a reverse proxy (adjust the port in the file).

## Development

```bash
npm ci
npm run dev
```

UI on port 8080. Tests: `node --experimental-strip-types --test src/lib/miniscript/miniscript.test.ts`

## StartOS

Wrapper and community docs: [`deploy/startos/README.md`](deploy/startos/README.md). Pack:

```bash
cd deploy/startos
./prepare.sh
make x86    # scriptwerk_x86_64.s9pk
make arm    # scriptwerk_aarch64.s9pk
```

In the StartOS GUI enable **Bitcoin Core** on Scriptwerk. Scriptwerk creates the RPC user `scriptwerk_xxxx` itself.

Community Registry: send the public repo to [submissions@start9.com](mailto:submissions@start9.com). Tag form `v{upstream}_{downstream}` is in `deploy/startos/UPDATING.md`.

## License / notice

A tool to design and check policies. Not a wallet, not a mainnet signer without your own review. Verify descriptor and checksum on Bitcoin Core and on the device before coins sit on it.

@teh_jenz on X

---

# Deutsch

Studio für Bitcoin-Miniscript-Wallets: Policy als Stufen bauen, Descriptor und Checksumme sehen, Keys (Master/Child) zuordnen, auf Bitcoin Core prüfen, auf Ledger oder BitBox registrieren.

Desktop und Mobil, Deutsch/Englisch. Bitcoin-Node darf auf einer anderen Maschine liegen.

## Features

- **Einfach / Experte** — Umschalter in der Kopfleiste, Einfach ist Standard. Experte blendet den Tab **Experte** ein (Desktop und Mobil): max. relatives Timelock, Struktur, Key-Wiederverwendung, Miniscript-Operatoren. Einfach blendet den Tab und die erweiterten Stufen-Optionen aus.
- **Stufen** — k-von-n, relatives Timelock (`older` / CSV), Keys die immer mitunterschreiben (`A + (B oder C)`), mehrere Recovery-Stufen
- **Timelock-Maximum (Experte)** — 65534 (Default, Nunchuk-kompatibel) oder 65535 (Bitcoin-Maximum). Nunchuk lehnt 65535 ab.
- **Struktur (Experte)** — Spät oder früh zuerst im Descriptor (gleiche Pfade, andere Checksumme)
- **pk / pkh und 2-von-2 (Experte)** — je Stufe `pk` oder `pkh`; 2-von-2 als `multi` oder `and_v`
- **Policy-Baum** — Zoom, Stufen antippen hebt den Zweig hervor
- **Keys** — Name, Fingerprint, A Master / A1 Child getrennt; Import per Text, QR, Datei, USB. Jeder Key zeigt genutzt/unbenutzt; Button **Unbenutzte löschen**
- **Key-Wiederverwendung (Experte)** — Aus: ein Fingerprint = ein Signing-Slot, Child-Keys A1, A2 … importieren. An: derselbe xpub mit hochzählender Ableitung in mehreren Stufen
- **Checksummen (Experte)** — Key-Reihenfolge und Ableitung `0/*` vs `<0;1>/*`; Suche nach bekannter Checksumme
- **Import / Export** — Descriptor, Miniscript, BSMS, Scriptwerk-JSON, `scriptwerk.keys.txt` (Namen), BIP-388 für Ledger und BitBox (QR, Datei, USB). Dateien tragen Key-Namen mit; QR bleibt ohne Kommentare.
- **Bitcoin Core** — `getdescriptorinfo` über Host-Proxy oder Node-Brücke. Auf StartOS: optionale Abhängigkeit; Scriptwerk legt RPC-Nutzer `scriptwerk_xxxx` selbst an
- **Hardware** — Ledger Bitcoin-App und BitBox02 (WebHID), Demo ohne Gerät
- **Selbst hosten** — ein Skript für Debian / Raspberry Pi (Docker oder Node)
- **StartOS** — Wrapper in `deploy/startos`, Sideload der `.s9pk` oder Community-Registry

## Voraussetzungen

- Debian oder Raspberry Pi OS (oder ein Linux mit Docker **oder** Node)
- Optional: Bitcoin Core im LAN (StartOS, eigener Node). Nicht nötig zum reinen Bauen.
- Browser: Chrome oder Edge für USB und Kamera

## Installation

```bash
git clone https://github.com/kwadde-cmyk/scriptwerk-startos.git
cd scriptwerk-startos
./deploy/install.sh --probe
./deploy/install.sh
```

`--probe` zeigt OS, belegte Ports und einen Port-Vorschlag. Ohne `SCRIPTWERK_PORT` fragt das Skript im Terminal.

Danach z. B. `http://127.0.0.1:8081` oder `http://<Pi-IP>:8081`.

Ohne Docker: `npm ci` + Node. Ohne beides bricht das Skript ab und nennt den Docker-Install.

## Aktualisieren

```bash
cd scriptwerk-startos
git pull
SCRIPTWERK_PORT=8081 ./deploy/install.sh
```

Port und RPC stehen in `deploy/.env` (wird beim Install überschrieben). Gleicher Port wie zuvor mitgeben.

Stoppen (Docker):

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

Node-Start: PID in `/tmp/scriptwerk.pid`, Log `/tmp/scriptwerk.log`.

## Parameter

| Variable / Flag | Bedeutung |
|---|---|
| `SCRIPTWERK_PORT` | HTTP-Port. Vorgabe aus `--probe` (oft 8081, wenn 80/8080 belegt). |
| `BITCOIND_RPC_URL` | RPC der Node, auch auf einem anderen Rechner. Leer = nur UI, Verbindung per Brücke. |
| `BITCOIND_RPC_USER` | RPC-Nutzer |
| `BITCOIND_RPC_PASSWORD` | RPC-Passwort |
| `--probe` | Nur Host prüfen, nichts installieren |
| `--dry-run` | Port/RPC anzeigen, nichts starten |
| `--simulate raspi` | Probe mit Beispiel-Pi |
| `--help` | Kurzhilfe |

Beispiel Remote-Node (StartOS):

```bash
SCRIPTWERK_PORT=8081 \
BITCOIND_RPC_URL=https://node.local:57521 \
BITCOIND_RPC_USER=scriptwerk \
BITCOIND_RPC_PASSWORD='…' \
./deploy/install.sh
```

## Node ohne direkten RPC

In der UI: **Node → Brücke**. Bookmarklet/Tab auf der Node offen lassen; Core spricht nur POST. GET-Fehler in der Diagnose sind normal.

StartOS: Bitcoin Core → Interfaces → RPC-LAN-Adresse (`.local` + https). Root-CA im Browser vertrauen, dann RPC-User anlegen.

## Browser im LAN (http, kein HTTPS)

Edge/Chrome behandeln `http://192.168.x.x:8081` nicht als sicher (USB, Kamera, LAN).

1. `edge://flags/#unsafely-treat-insecure-origin-as-secure` (Chrome: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`)
2. Enable, Origin eintragen: `http://<Pi-IP>:8081`
3. Browser neu starten, lokales Netzwerk zulassen

Oder SSH-Tunnel: `ssh -L 8081:127.0.0.1:8081 pi@pi4` → `http://127.0.0.1:8081`

## Nginx davor

Wenn 80/443 schon ein Webserver ist, Scriptwerk auf 8081 lassen und `deploy/nginx-scriptwerk.conf` als Reverse-Proxy (Port darin anpassen).

## Entwicklung

```bash
npm ci
npm run dev
```

UI unter Port 8080. Tests: `node --experimental-strip-types --test src/lib/miniscript/miniscript.test.ts`

## StartOS

Wrapper und Community-Doku: [`deploy/startos/README.md`](deploy/startos/README.md). Packen:

```bash
cd deploy/startos
./prepare.sh
make x86    # scriptwerk_x86_64.s9pk
make arm    # scriptwerk_aarch64.s9pk
```

In der StartOS-GUI bei Scriptwerk **Bitcoin Core** einschalten. Scriptwerk legt den RPC-Nutzer `scriptwerk_xxxx` selbst an.

Community-Registry: öffentliches Repo an [submissions@start9.com](mailto:submissions@start9.com). Tag-Form `v{upstream}_{downstream}` steht in `deploy/startos/UPDATING.md`.

## Lizenz / Hinweis

Werkzeug zum Entwerfen und Prüfen von Policies. Keine Wallet, kein Signer fürs Hauptnetz ohne eigene Prüfung. Descriptor und Checksumme an Bitcoin Core und am Gerät verifizieren, bevor Coins darauf liegen.

@teh_jenz on X
