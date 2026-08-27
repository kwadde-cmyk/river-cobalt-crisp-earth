/**
 * StartOS 0.4 package sketch for @start9labs/start-sdk.
 * Copy this folder into a wrapper repo `scriptwerk-startos` and run the SDK pack.
 *
 *   id: scriptwerk
 *   ui port: 8080
 *   optional dependency: bitcoind / bitcoin
 */
export const sketch = {
  id: "scriptwerk",
  title: "Scriptwerk",
  license: "MIT",
  version: "0.1.0",
  description: {
    short: {
      en_US: "SegWit Miniscript policy studio",
      de_DE: "SegWit-Miniscript Studio",
    },
    long: {
      en_US:
        "Build, import and check Nunchuk-style wsh() miniscript policies. Optional JSON-RPC to Bitcoin Core on the same device.",
      de_DE:
        "Nunchuk-taugliche wsh()-Miniscript-Policies bauen, importieren und gegen Bitcoin Core prüfen.",
    },
  },
  volumes: ["main"],
  images: {
    main: {
      source: { dockerBuild: { workdir: "..", dockerfile: "Dockerfile" } },
      arch: ["x86_64", "aarch64"],
    },
  },
  interfaces: {
    ui: { type: "ui", port: 8080 },
  },
  dependencies: {
    bitcoin: {
      description: "JSON-RPC for getdescriptorinfo / deriveaddresses",
      optional: true,
    },
  },
};
