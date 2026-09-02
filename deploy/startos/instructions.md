# Scriptwerk on StartOS 0.4

After install, open **Interfaces → UI**. The studio is a website on your LAN
(`.local` + StartOS TLS).

Package version **0.1.0**. Sideload or publish to your registry while testing,
then the same `.s9pk` goes to the community registry (new version number each
time). Pack **x86 and arm**: `make x86` and `make arm`.

## Bitcoin Core (optional)

In **Config / Dependencies**, enable **Bitcoin Core**. Scriptwerk then:

1. Creates RPC user **`scriptwerk`** on Core (password stays on the server).
2. Talks to Core over the internal network — no bookmarklet / Node-Brücke.

If Core is not installed, the UI still works. You can attach a remote node in
the Node dialog as before.

## Android / desktop

Open the UI URL in Chrome → Add to Home Screen. Ledger/BitBox USB needs a
desktop Chromium with WebHID — not the StartOS webview.

## Backup

Policy state lives in the **browser** (localStorage), not in the service
volume. Export descriptors/BSMS before wiping the service. StartOS backup of
this package does not contain your keys.
