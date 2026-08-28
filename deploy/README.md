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