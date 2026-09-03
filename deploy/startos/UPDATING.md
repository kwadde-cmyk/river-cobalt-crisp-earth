# Updating

## Determining the upstream version

Scriptwerk is packaged from this same repository. There is no separate upstream image tag.

- Studio source: repository root (`src/`, `package.json`, `Dockerfile`).
- Wrapper version (Emver): `startos/versions/current.ts` field `version`.
- npm package field: `package.json` `version` (upstream portion only).

When the studio UI or the Dockerfile changes, bump the **upstream** portion and reset downstream to `0` (example: `0.1.8:0`). When only wrapper files under `deploy/startos/startos/` change, keep upstream and increment **downstream** (example: `0.1.7:1`).

## Manifest pins

- Image build context: `images.main.source.dockerBuild.workdir` / `dockerfile` in `startos/manifest/index.ts` (repo root).
- Architectures: `images.main.arch`.
- Optional dependency range: `dependencies.ts` `versionRange` for `bitcoind`.

## Git tag

Tag format: `v{upstream}_{downstream}` — colon becomes underscore, no package-id prefix.

```bash
git tag v0.1.7_0
git push origin v0.1.7_0
```

Push that tag alone, not `git push --tags`.
