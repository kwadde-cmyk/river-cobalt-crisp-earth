# Scriptwerk StartOS 0.4 wrapper

[`@start9labs/start-sdk`](https://github.com/Start9Labs/start-sdk) **2.0.9** package for Scriptwerk.

- id: `scriptwerk`
- version: `0.1.0` (`startos/versions/current.ts`)
- UI: port **8080**, image built from the repo `Dockerfile`
- arches: **x86_64** and **aarch64** (`make x86` / `make arm`)
- optional dependency: **Bitcoin Core** (`bitcoind`) — RPC user `scriptwerk`

## Pack

Needs Docker and Node 22+. Your server is x86; still build both if others (Pi)
should install from the same registry.

```bash
cd deploy/startos
npm ci
make x86    # → scriptwerk_x86_64.s9pk
make arm    # → scriptwerk_aarch64.s9pk
```

## Test on your private registry

1. Registry **Configure** + **Add Administrator** (`start-cli pubkey`).
2. Add the Web-API URL as marketplace source on the device.
3. `start-cli -r 'https://…' registry package add scriptwerk_x86_64.s9pk`
4. Install from that marketplace. Enable Bitcoin Core in Scriptwerk config.

Sideload still works without a registry.

## Later: community registry

Same wrapper, higher version, email [submissions@start9.com](mailto:submissions@start9.com).
Do not reuse the private-registry test tag; bump `startos/versions/current.ts`.

## Update

1. Bump `version` in `startos/versions/current.ts` (Emver, e.g. `0.1.1:0`).
2. Keep a historical file under `startos/versions/` if a migration is needed.
3. Match `version` in this `package.json`.
4. Pack both arches, `registry package add` again.

## Bitcoin

Optional. Enabling it in the StartOS GUI creates RPC user **scriptwerk** via
Core’s hidden `generate-rpc-dependent` action and injects URL/user/password
into the container. The studio auto-connects; no bridge on the same device.
