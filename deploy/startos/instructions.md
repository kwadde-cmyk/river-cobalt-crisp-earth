# Scriptwerk on StartOS

After install, open **Interfaces → UI**. The studio is a website on your LAN (`.local` + StartOS TLS).

## Bitcoin Core (optional)

In **Config / Dependencies**, enable **Bitcoin Core**. Scriptwerk then:

1. Creates a unique RPC user `scriptwerk_` plus a random suffix (Core does not allow a hyphen in the name).
2. Talks to Core over the internal network — no bookmarklet.
3. Locks the Node dialog on those credentials. Unlock to point at another RPC; **Reset** restores the StartOS values.

If Core is not installed, the UI still works. Enter any RPC URL when unlocked.

## Android / desktop

Open the UI URL in Chrome → Add to Home Screen. Ledger/BitBox USB needs a desktop Chromium with WebHID — not the StartOS webview.

## Backup

Policy state lives in the **browser** (`localStorage`), not in the service volume. Export descriptors or BSMS before wiping the service. A StartOS backup of this package does not contain your keys.
