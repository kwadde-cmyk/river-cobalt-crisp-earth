#!/usr/bin/env bash
# Start9-style prepare: wrapper install + bundle. Image build happens in pack.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec bash "$ROOT/deploy/startos/prepare.sh"
