# Scriptwerk

Studio für Bitcoin-Miniscript-Wallets: Policy als Stufen bauen, Descriptor und Checksumme sehen, Keys (Master/Child) zuordnen, auf Bitcoin Core prüfen, auf Ledger oder BitBox registrieren.

Desktop und Mobil, Deutsch/Englisch. Bitcoin-Node darf auf einer anderen Maschine liegen.

## Features

- **Einfach / Experte** — Umschalter in der Kopfleiste, Einfach ist Standard. Experte blendet den Tab **Expert** ein (Desktop und Mobil): max. relatives Timelock, Struktur, Key-Reuse, Miniscript-Operatoren. Einfach blendet den Tab und die erweiterten Stufen-Optionen aus.
- **Stufen** — k-von-n, relatives Timelock (`older` / CSV), Keys die immer mitunterschreiben (`A + (B oder C)`), mehrere Recovery-Stufen
- **Timelock-Maximum (Experte)** — 65534 (Default, Nunchuk-kompatibel) oder 65535 (Bitcoin-Maximum). Nunchuk lehnt 65535 ab.
- **Struktur (Experte)** — Spät oder früh zuerst im Descriptor (gleiche Pfade, andere Checksumme)
- **pk / pkh und 2-von-2 (Experte)** — je Stufe `pk` oder `pkh`; 2-von-2 als `multi` oder `and_v`
- **Policy-Baum** — Zoom, Stufen antippen hebt den Zweig hervor
- **Keys** — Name, Fingerprint, A Master / A1 Child getrennt; Import per Text, QR, Datei, USB. Jeder Key zeigt genutzt/unbenutzt; Button **Unbenutzte löschen**
- **Key-Reuse (Experte)** — Aus: ein Fingerprint = ein Signing-Slot, Childkeys A1, A2 … importieren. An: derselbe xpub mit hochzählender Ableitung in mehreren Stufen
- **Checksummen (Experte)** — Key-Reihenfolge und Ableitung `0/*` vs `<0;1>/*`; Suche nach bekannter Checksumme
- **Import / Export** — Descriptor, Miniscript, BSMS, Scriptwerk-JSON, BIP-388 für Ledger und BitBox (QR, Datei, USB)
- **Bitcoin Core** — `getdescriptorinfo` über Host-Proxy oder Node-Brücke. Auf StartOS: optionale Abhängigkeit; Scriptwerk legt RPC-Nutzer `scriptwerk_xxxx` selbst an
- **Hardware** — Ledger Bitcoin-App 2.1+ und BitBox02 (WebHID), Demo ohne Gerät
- **Selbst hosten** — ein Skript für Debian / Raspberry Pi (Docker oder Node)
- **StartOS 0.4** — SDK-Wrapper in `deploy/startos`, Version **0.1.3**, Sideload der `.s9pk`

## Voraussetzungen

- Debian oder Raspberry Pi OS (oder ein Linux mit Docker **oder** Node 18+)
- Optional: Bitcoin Core im LAN (StartOS, eigener Node). Nicht nötig zum reinen Bauen.
- Browser: Chrome oder Edge für USB und Kamera

## Installation

```bash
git clone https://github.com/kwadde-cmyk/river-cobalt-crisp-earth.git
cd river-cobalt-crisp-earth
./deploy/install.sh --probe
./deploy/install.sh
```

`--probe` zeigt OS, belegte Ports und einen Port-Vorschlag. Ohne `SCRIPTWERK_PORT` fragt das Skript im Terminal.

Danach z. B. `http://127.0.0.1:8081` oder `http://<Pi-IP>:8081`.

Ohne Docker: `npm ci` + Node. Ohne beides bricht das Skript ab und nennt den Docker-Install.

## Aktualisieren

```bash
cd river-cobalt-crisp-earth
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

StartOS 0.4: Bitcoin Core → Interfaces → RPC-LAN-Adresse (`.local` + https). Root-CA im Browser vertrauen, dann RPC-User anlegen.

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

## StartOS 0.4

Wrapper: `deploy/startos` (`@start9labs/start-sdk` 2.0.9). Paket-Version **0.1.3** (`deploy/startos/package.json` und `deploy/startos/startos/versions/current.ts`).

```bash
cd deploy/startos
npm ci
make x86    # scriptwerk_x86_64.s9pk
make arm    # scriptwerk_aarch64.s9pk
```

Dein Server ist x86, `make arm` zusätzlich für Pi-Geräte in derselben Registry.

In der StartOS-GUI bei Scriptwerk **Bitcoin Core** einschalten. Dann wird RPC-Nutzer **scriptwerk** auf Core angelegt, das Studio verbindet ohne Brücke.

## Lizenz / Hinweis

Werkzeug zum Entwerfen und Prüfen von Policies. Keine Wallet, kein Signer fürs Hauptnetz ohne eigene Prüfung. Descriptor und Checksumme an Bitcoin Core und am Gerät verifizieren, bevor Coins darauf liegen.

@teh_jenz on X