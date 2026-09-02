# Scriptwerk StartOS wrapper

This folder is a StartOS **0.4** service package (`start-sdk` 2.0.9).

- Runtime UI is the parent repo (Docker build `../../Dockerfile`).
- Do not put app source here — only packager code under `startos/`.
- Version lives in `startos/versions/current.ts`.
- `make x86` / `make arm` after `npm ci`.
