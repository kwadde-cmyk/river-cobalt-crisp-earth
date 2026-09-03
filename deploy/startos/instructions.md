# Scriptwerk on StartOS 0.4

After install, open **Interfaces → UI**. The studio is a website on your LAN
(`.local` + StartOS TLS).

Package version **0.1.7**. Sideload or publish to your registry while testing.
Pack **x86 and arm**: `make x86` and `make arm`.

## Bitcoin Core (optional)

In **Config / Dependencies**, enable **Bitcoin Core**. Scriptwerk then:

1. Creates a unique RPC user **`scriptwerk_xxxxxxxx`** on Core (password stays on the server).
2. Talks to Core over the internal network — no bookmarklet / Node-Brücke.
3. The Node dialog is **locked** on those credentials. Unlock to point at another RPC; **Reset** restores StartOS values.

If Core is not installed, the UI still works. Enter any RPC URL when unlocked.

## Android / desktop

Open the UI URL in Chrome → Add to Home Screen. Ledger/BitBox USB needs a
desktop Chromium with WebHID — not the StartOS webview.

## Backup

Policy state lives in the **browser** (localStorage), not in the service
volume. Export descriptors/BSMS before wiping the service. StartOS backup of
this package does not contain your keys.
