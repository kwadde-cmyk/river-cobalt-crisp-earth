# Scriptwerk

This directory is the StartOS package wrapper. The studio image is built from the repository-root Dockerfile. Policy data lives in the visitor browser, not in the service volume.

## Image and Container Runtime

The `main` image is built from the repository-root Dockerfile (`dockerBuild.workdir` is the repo root). The runtime container is Node, listens on the UI port declared in `startos/utils.ts`, and runs `node scripts/host.mjs` as a non-root user. No extra capabilities, nested runtimes, or host devices are required.

## Volume and Data Layout

Volume `main` is mounted at `/data` in the UI container. StartOS writes package metadata there. The only application file on that volume is `store.json` (RPC username and password for the optional Bitcoin Core dependency). Wallet keys, descriptors, and policies are **not** stored on the volume.

## File Models

`store.json` on volume `main` holds `rpcUser` and `rpcPassword`. Scriptwerk generates both when Bitcoin Core is enabled and asks Core to create that `rpcauth` entry. Do not copy a password from Core’s “Generate RPC User” action; Core only stores a hash.

## Dependencies

Bitcoin Core (`bitcoind`) is optional. When enabled, Scriptwerk expects Core to be running and healthy, creates a unique RPC user `scriptwerk_` plus random suffix (Core usernames cannot contain a hyphen), and talks to Core over the internal StartOS network. No volume from Core is mounted. If Core is off, the studio still runs; the Node dialog can point at another RPC.

## Network Access and Interfaces

Interface `ui` is type `ui`, HTTP, internal port from `uiPort`, path `/`. StartOS terminates TLS on the LAN `.local` address. There is no separate API or P2P interface. Outbound RPC to Core uses the injected bridge address, not a public port.

## Installation and First-Run Flow

Install from a registry or sideload the `.s9pk`. Start the service and open **Interfaces → UI**. If Bitcoin Core should check descriptors on this device, enable the Bitcoin Core dependency and complete the one-time task that creates the RPC user. Then open the Node dialog: it is locked on those credentials. Unlock only to reach a different node; Reset restores the StartOS values.

## Actions

None. Scriptwerk exposes no user-facing StartOS actions. RPC-user creation on Core uses Core’s hidden `generate-rpc-dependent` action via a task, not an action on this package.

## Tasks

When Bitcoin Core is newly enabled and Scriptwerk has just minted credentials, one **important** (not critical) task asks Core to create that RPC user. The task is issued once per new credential set. Completing it is required for same-device `getdescriptorinfo`. Dismissing it does not stop the UI.

## Health Checks

The daemon `primary` reports ready when the UI port is listening. There is no application-level probe beyond that. A green health check means the studio process is up, not that Bitcoin Core is reachable.

## Backups and Restore

StartOS backup includes volume `main` only — that is `store.json` (RPC user). Descriptors, key names, xpubs, and policies live in the **browser** (`localStorage`) on the device that opened the UI. Restore brings back the RPC login, not the wallet design. Export descriptor or BSMS from the studio before wiping the browser or the service.

## Limitations and Differences

1. Not a wallet and not a signer. It designs and checks policies; coins never sit in this service.
2. StartOS backup does not contain keys or policies.
3. Ledger and BitBox USB need a desktop Chromium with WebHID. The StartOS webview and most phones cannot register hardware.
4. Same-device Core RPC is injected and locked. A different node works only after unlocking the Node dialog; the host proxy is then skipped so the form URL and password are used.
5. SegWit `wsh()` miniscript only. Taproot / `tr()` is not implemented.
6. Relative timelock ceiling is a studio setting; some companion apps reject the Bitcoin maximum.
7. Deprecated npm warnings during the image build (Ledger helper, chart lib, ESLint) do not change the runtime.

## Quick Reference for AI Consumers

- Package id: `scriptwerk`. Wrapper root: `deploy/startos`.
- Version lives in `startos/versions/current.ts` (Emver `upstream:downstream`) and `package.json`. Git tag is `v{upstream}_{downstream}`.
- Image: repo-root `Dockerfile`, both `x86_64` and `aarch64`.
- Optional dependency: `bitcoind`. File model: `store.json` on volume `main`.
- UI port: `uiPort` in `startos/utils.ts`. Daemon command: `node scripts/host.mjs`.
- Pack from this directory after `npm ci`: `make x86` and `make arm`.
- Prepare script: `./prepare.sh` (npm ci, typecheck, ncc bundle).
