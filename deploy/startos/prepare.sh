#!/usr/bin/env bash
# Run from deploy/startos. Installs wrapper deps and bundles the SDK entrypoint.
set -euo pipefail
cd "$(dirname "$0")"
npm ci
npm run check
npm run build
