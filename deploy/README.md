# Scriptwerk auf dem Homeserver (Debian / Raspi)

Bitcoin-Node muss nicht auf derselben Maschine sein.

```bash
./deploy/install.sh --probe              # Webserver + Ports prüfen
./deploy/install.sh --dry-run            # Port/RPC zeigen, nichts starten
./deploy/install.sh --simulate raspi     # Beispiel: Pi mit Nginx
./deploy/install.sh                      # installieren, Port vorschlagen
```

Remote-Node (StartOS, anderer Rechner):

```bash
SCRIPTWERK_PORT=8081 \
BITCOIND_RPC_URL=https://node.local:57521 \
BITCOIND_RPC_USER=scriptwerk \
BITCOIND_RPC_PASSWORD='…' \
./deploy/install.sh
```

Ohne RPC-URL startet nur die Website; Core verbindest du in der UI per Brücke.

Wenn Nginx/Apache schon 80/443 belegen, nimmt Scriptwerk z. B. **8081**.
Optional: `deploy/nginx-scriptwerk.conf` als Reverse-Proxy.

## Edge / Chrome ohne HTTPS (LAN)

`http://<Pi-IP>:8081` ist kein „Secure Context“. Edge sperrt dann oft Kamera, USB und LAN-RPC.

**Am einfachsten:** die Adresse einmal als vertrauenswürdig markieren.

1. `edge://flags/#unsafely-treat-insecure-origin-as-secure` öffnen.
2. Enable, ins Textfeld z. B. `http://192.168.1.20:8081` (deine Pi-IP).
3. Edge neu starten.
4. Beim Hinweis **Lokales Netzwerk** → Zulassen.

Oder per SSH, dann gilt localhost als sicher:

```bash
ssh -L 8081:127.0.0.1:8081 pi@pi4
```

Browser: `http://127.0.0.1:8081`

HTTPS-First in Edge für diese Seite ausnehmen, falls er ständig auf https umbiegt.