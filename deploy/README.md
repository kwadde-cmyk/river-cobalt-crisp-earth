# Scriptwerk hosten

Ein Image, vier Wege. Die App bleibt eine Website (PWA). USB-Hardware nur in
Desktop-Chrome (WebHID).

## 1. Linux-Homeserver — ein Befehl

Im geklonten Repo:

```bash
./deploy/install.sh
```

Öffnet Port **8080**. Optional RPC direkt (dann keine Node-Brücke):

```bash
BITCOIND_RPC_URL=http://127.0.0.1:8332 \
BITCOIND_RPC_USER=scriptwerk \
BITCOIND_RPC_PASSWORD='…' \
./deploy/install.sh
```

Autostart: `deploy/scriptwerk.service` nach `/etc/systemd/system/` (WorkingDirectory anpassen).

## 2. Dieser Rechner (lokal)

```bash
npm ci
npm run build:host
BITCOIND_RPC_URL=http://127.0.0.1:8332 npm start
```

Oder dasselbe Docker-Compose wie oben. Chrome: Site installieren (PWA).
`deploy/scriptwerk.desktop` ins Anwendungsmenü.

## 3. StartOS v0.4 Community Registry

1. Wrapper-Repo `scriptwerk-startos` (Vorlage [hello-world-startos](https://github.com/Start9Labs/hello-world-startos)).
2. Diesen `Dockerfile` als Image, UI-Port **8080**, optional Dependency **bitcoin**.
3. Skizze: `deploy/startos/manifest.ts`, Texte: `deploy/startos/instructions.md`.
4. `s9pk` bauen, sideloaden; für die Registry: [Community Registry](https://docs.start9.com/packaging/0.4.0.x/publishing.html).

Auf StartOS mit RPC-Proxy: gleiche Origin wie die UI — **kein Bookmarklet**.

## 4. Android

Die **LAN-URL** in Chrome öffnen → Zum Startbildschirm hinzufügen.
(`/?install=1` erklärt die Schritte.)

Ledger/BitBox per USB geht auf Android nicht. Import: Datei, QR, Descriptor.

## RPC-Proxy

Wenn `BITCOIND_RPC_URL` gesetzt ist, nimmt die Instanz `POST /bitcoind-rpc`
entgegen (same-origin). Nicht ins WAN legen ohne extra Absicherung
(StartOS-TLS / Firewall nur LAN).
