# Scriptwerk on StartOS 0.4

After install, open **Interfaces → UI**. The studio is a normal website on your
LAN (`.local` + StartOS TLS).

## Bitcoin Core

If this package lists **Bitcoin** as a dependency, Scriptwerk talks to Core
through a same-origin RPC proxy. No bookmarklet.

Otherwise: Bitcoin Core → Interfaces → RPC → copy the `.local` https address,
trust the Root CA, create RPC credentials, then use **Node-Brücke** in the UI.

## Android / desktop

Open the UI URL in Chrome → Add to Home Screen / Install. Ledger/BitBox USB
needs a desktop Chromium with WebHID.

## Backup

Policy state lives in the browser (localStorage). Export descriptors/BSMS
before wiping the service.
