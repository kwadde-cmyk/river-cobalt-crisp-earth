import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { descsumCheck, descsumCreate } from "./checksum.ts";
import { compileDescriptor, compileMiniscript, expandAliasKeys } from "./compile.ts";
import { explainPolicy } from "./explain.ts";
import {
  applyKeyMaterial,
  attachChildOrReplace,
  buildKeyTree,
  emptyKey,
  extractKeysFromTree,
  formatBip32Path,
  keyHeadline,
  keyNeedsAction,
  keyTileLabel,
  tokenNeedsAction,
  nextUnusedAccount,
  parseChildKey,
  parseKeyExpr,
  parseKeyList,
} from "./keys.ts";
import { parseAny } from "./parser.ts";
import { compileStages } from "./stages.ts";
import {
  compileBip388,
  formatBitboxJson,
  formatLedgerJson,
  materializeWalletPolicy,
  parseWalletPolicy,
  walletPolicyToDescriptor,
} from "./bip388.ts";
import { defaultAccountPath, formatOrigin, normalizeHwPath, pathToDerivation } from "../hw/types.ts";
import { openDemoSession } from "../hw/demo.ts";

const XPUB =
  "xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5hqK5Gb4u1Q2ZbQW2kfykAPzh9RQQJwYvNUbaMhEaKfLUWuBvYJMTx5N";

describe("parser", () => {
  it("parses nested miniscript and wrappers", () => {
    const { node } = parseAny("and_v(v:pk(A),or_d(pk(B),pk(C)))");
    assert.equal(node.kind, "and_v");
    if (node.kind !== "and_v") return;
    assert.equal(node.left.kind, "wrap");
    assert.equal(compileMiniscript(node), "and_v(v:pk(A),or_d(pk(B),pk(C)))");
  });

  it("strips wsh and checksum", () => {
    const inner = "multi(2,A,B,C)";
    const desc = descsumCreate(`wsh(${inner})`);
    const parsed = parseAny(desc);
    assert.equal(parsed.wrapper, "wsh");
    assert.equal(compileMiniscript(parsed.node), inner);
    assert.equal(descsumCheck(desc), true);
  });

  it("reads BSMS with newlines", () => {
    const desc = descsumCreate("wsh(pk(A))");
    const bsms = `BSMS 1.0\n${desc}\n/0/*,/1/*`;
    const parsed = parseAny(bsms);
    assert.equal(parsed.node.kind, "pk");
  });
});

describe("keys", () => {
  it("parses origin key expressions", () => {
    const p = parseKeyExpr(`[deadbeef/48h/0h/0h/2h]${XPUB}/<0;1>/*`);
    assert.equal(p.kind, "origin");
    assert.equal(p.fingerprint, "deadbeef");
    assert.equal(p.derivation, "48'/0'/0'/2'");
    assert.equal(p.xpub, XPUB);
    assert.equal(p.multipath, "<0;1>");
  });

  it("extracts origin keys into aliases", () => {
    const parsed = parseAny(`wsh(and_v(v:pk([deadbeef/48h/0h/0h/2h]${XPUB}/<0;1>/*),pk(B)))`);
    const { node, keys } = extractKeysFromTree(parsed.node, []);
    assert.equal(compileMiniscript(node), "and_v(v:pk(A),pk(B))");
    assert.equal(keys[0]?.name, "A");
    assert.equal(keys[0]?.xpub, XPUB);
    assert.equal(keys[1]?.name, "B");
  });

  it("parses a pubkey list", () => {
    const list = parseKeyList(`A ${XPUB}\nB [aabbccdd/48h/0h/0h/2h]${XPUB}/*`);
    assert.ok(list);
    assert.equal(list![0]?.name, "A");
    assert.equal(list![0]?.xpub, XPUB);
    assert.equal(list![1]?.name, "B");
    assert.equal(list![1]?.fingerprint, "aabbccdd");
  });

  it("applies origin material onto an existing alias", () => {
    const slot = emptyKey("B");
    const result = applyKeyMaterial(slot, `[aabbccdd/48h/0h/0h/2h]${XPUB}/<0;1>/*`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.key.name, "B");
    assert.equal(result.key.fingerprint, "aabbccdd");
    assert.equal(result.key.derivation, "48'/0'/0'/2'");
    assert.equal(result.key.xpub, XPUB);
    assert.equal(formatBip32Path(result.key), "m/48'/0'/0'/2'");
    assert.equal(keyHeadline({ ...result.key, note: "Coldcard" }), "Coldcard");
    assert.equal(keyHeadline(result.key), "aabbccdd");
  });

  it("reads coldcard-style json onto a slot", () => {
    const result = applyKeyMaterial(
      emptyKey("A"),
      JSON.stringify({ xfp: "E60EDD9C", p2wsh: XPUB, p2wsh_deriv: "m/48'/0'/0'/2'" }),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.key.fingerprint.toLowerCase(), "e60edd9c");
    assert.equal(result.key.xpub, XPUB);
    assert.equal(result.key.derivation, "48'/0'/0'/2'");
  });

  it("rejects a full policy on a single key slot", () => {
    const result = applyKeyMaterial(emptyKey("A"), "wsh(multi(2,A,B,C))");
    assert.equal(result.ok, false);
  });

  it("parses a child path after the xpub", () => {
    const p = parseKeyExpr(`[deadbeef/48h/0h/0h/2h]${XPUB}/0/5`);
    assert.equal(p.xpub, XPUB);
    assert.equal(p.childPath, "0/5");
    assert.equal(p.derivation, "48'/0'/0'/2'");
  });

  it("attaches a path-only child onto a filled parent", () => {
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    const child = parseChildKey(parent, "0/0");
    assert.equal(child.ok, true);
    if (!child.ok) return;
    assert.equal(child.child.path, "0/0");
    const tree = buildKeyTree({ ...parent, children: [child.child] });
    assert.equal(tree.label, "m/48'/0'/0'/2'");
    assert.ok(tree.children.some((c) => c.label === "0/0"));
  });

  it("attaches a sibling account of the same fingerprint as child", () => {
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    const a = parseChildKey(parent, "[deadbeef]m/48'/0'/1'/2'");
    assert.equal(a.ok, true);
    if (!a.ok) return;
    assert.equal(a.child.path, "48'/0'/1'/2'");
    assert.equal(a.child.fingerprint, "deadbeef");
    const b = parseChildKey(parent, "[deadbeef/48'/0'/1'/2']");
    assert.equal(b.ok, true);
    if (!b.ok) return;
    assert.equal(b.child.path, "48'/0'/1'/2'");
    const tree = buildKeyTree({ ...parent, children: [a.child] });
    assert.equal(tree.label, "m");
    assert.ok(tree.children.some((c) => c.label === "48'/0'/1'/2'"));
  });

  it("picks the next unused BIP48 account", () => {
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    assert.equal(nextUnusedAccount(parent).path, "48'/0'/1'/2'");
    const withChild = parseChildKey(parent, "[deadbeef]m/48'/0'/1'/2'");
    assert.equal(withChild.ok, true);
    if (!withChild.ok) return;
    assert.equal(nextUnusedAccount({ ...parent, children: [withChild.child] }).path, "48'/0'/2'/2'");
  });

  it("accepts a bare xpub as child on the next account", () => {
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    const child = parseChildKey(
      parent,
      "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
      {
        fallbackPath: "48'/0'/1'/2'",
        alias: "A1",
      },
    );
    assert.equal(child.ok, true);
    if (!child.ok) return;
    assert.equal(child.child.path, "48'/0'/1'/2'");
    assert.equal(child.child.note, "A1");
  });

  it("attaches a deeper origin as child instead of replacing", () => {
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    const result = attachChildOrReplace(parent, `[deadbeef/48h/0h/0h/2h/0]${XPUB}`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.key.xpub, XPUB);
    assert.equal(result.key.children[0]?.path, "0");
  });

  it("labels a tile with name, else fingerprint, else alias", () => {
    const a = emptyKey("A");
    assert.equal(keyTileLabel(a), "A");
    assert.equal(keyTileLabel({ ...a, fingerprint: "DEADBEEF" }), "deadbeef");
    assert.equal(keyTileLabel({ ...a, fingerprint: "deadbeef", note: "Coldcard" }), "Coldcard");
  });

  it("flags empty keys and missing child accounts", () => {
    const empty = emptyKey("A");
    assert.equal(keyNeedsAction(empty, [], false), "empty");
    const filled = {
      ...empty,
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
    };
    assert.equal(keyNeedsAction(filled, [{ account: 1 }], false), "child");
    assert.equal(tokenNeedsAction("A", [filled], false), false);
    assert.equal(tokenNeedsAction("A1", [filled], false), true);
    assert.equal(tokenNeedsAction("A", [empty], true), true);
  });
});

describe("stages", () => {
  it("compiles 2-of-3 without timelock", () => {
    const { root } = compileStages([{ id: "s1", delay: 0, k: 2, keys: ["A", "B", "C"] }]);
    assert.equal(compileMiniscript(root), "multi(2,A,B,C)");
  });

  it("nests later timelocks outside, aliases reused keys", () => {
    const { root } = compileStages([
      { id: "s1", delay: 0, k: 2, keys: ["A", "B", "C"] },
      { id: "s2", delay: 60000, k: 2, keys: ["A", "D"] },
      { id: "s3", delay: 65534, k: 2, keys: ["B", "C", "D"] },
    ]);
    const ms = compileMiniscript(root);
    assert.equal(
      ms,
      "or_i(and_v(v:multi(2,B2,C2,D2),older(65534)),or_i(and_v(v:multi(2,A2,D1),older(60000)),multi(2,A1,B1,C1)))",
    );
    const exp = explainPolicy(root);
    assert.equal(exp.groups.length, 3);
    assert.equal(exp.groups[0]?.delay, 0);
    assert.ok(exp.groups.some((g) => g.delay === 60000));
    assert.ok(exp.groups.some((g) => g.delay === 65534));
    const en = explainPolicy(root, "en");
    assert.match(en.title, /time-locked|now|later|immediate/i);
  });

  it("compiles a complete policy to a checksummed descriptor with alias xpubs", () => {
    const { root } = compileStages([
      { id: "s1", delay: 0, k: 2, keys: ["A", "B", "C"] },
      { id: "s2", delay: 144, k: 1, keys: ["A"] },
    ]);
    const compiled = compileDescriptor(root, [
      { ...emptyKey("A"), xpub: XPUB, fingerprint: "deadbeef" },
      emptyKey("B"),
      emptyKey("C"),
    ]);
    assert.equal(compiled.ok, true);
    assert.match(compiled.descriptor, /#[a-z0-9]{8}$/);
    assert.equal(descsumCheck(compiled.descriptor), true);
    assert.match(compiled.descriptor, /deadbeef/);
    assert.equal(compiled.descriptor.includes("A1") || compiled.descriptor.includes(XPUB), true);
  });

  it("uses distinct child accounts when reuse is off", () => {
    const { root } = compileStages(
      [
        { id: "s1", delay: 0, k: 2, keys: ["A", "B"] },
        { id: "s2", delay: 144, k: 1, keys: ["A"] },
      ],
      false,
    );
    assert.equal(compileMiniscript(root), "or_i(and_v(v:pk(A1),older(144)),multi(2,A,B))");
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
      children: [
        {
          id: "ck1",
          path: "48'/0'/1'/2'",
          xpub: "xpub6C6nQwHaTbszB3GXfbJNNGYUmGQmAwb1zUfxCQ4QFJYpNaDw6P8vqQdPdFMv1eVqBtgvHXuiVMtobd6MwPkhBUFC14BHupS6aHiJvRoG9sK",
          fingerprint: "deadbeef",
          note: "A1",
        },
      ],
    };
    const expanded = expandAliasKeys(root, [parent, emptyKey("B")], false);
    const a1 = expanded.find((k) => k.name === "A1");
    assert.equal(a1?.derivation, "48'/0'/1'/2'");
    assert.ok(a1?.xpub.startsWith("xpub6C6n"));
  });
});

describe("bip388", () => {
  const keyA = { ...emptyKey("A"), xpub: XPUB, fingerprint: "deadbeef", derivation: "48'/0'/0'/2'" };
  const keyB = {
    ...emptyKey("B"),
    xpub: XPUB.replace("Bosf", "Bosg"),
    fingerprint: "cafebabe",
    derivation: "48'/0'/0'/2'",
  };

  it("compiles a 2-of-3 to @ placeholders", () => {
    const { root } = compileStages([{ id: "s1", delay: 0, k: 2, keys: ["A", "B", "C"] }]);
    const out = compileBip388(root, [keyA, keyB, emptyKey("C")], "Vault");
    assert.equal(out.ok, true);
    assert.equal(out.policy.template, "wsh(multi(2,@0/**,@1/**,@2/**))");
    assert.equal(out.policy.name, "Vault");
    assert.equal(out.policy.keys[0]?.origin, `[deadbeef/48'/0'/0'/2']${XPUB}`);
    assert.ok(out.warnings.some((w) => w.startsWith("missingXpub:C")));
  });

  it("reuses the same @ index for A1/A2 aliases", () => {
    const { root } = compileStages([
      { id: "s1", delay: 0, k: 2, keys: ["A", "B"] },
      { id: "s2", delay: 144, k: 1, keys: ["A"] },
    ]);
    const out = compileBip388(root, [keyA, keyB]);
    assert.equal(out.ok, true);
    assert.equal(out.policy.template, "wsh(or_i(and_v(v:pk(@0/**),older(144)),multi(2,@0/**,@1/**)))");
    assert.equal(out.policy.keys.length, 2);
  });

  it("roundtrips ledger json", () => {
    const { root } = compileStages([{ id: "s1", delay: 0, k: 2, keys: ["A", "B"] }]);
    const compiled = compileBip388(root, [keyA, keyB]);
    const json = formatLedgerJson(compiled.policy);
    const parsed = parseWalletPolicy(json);
    assert.ok(parsed);
    assert.match(parsed!.template, /@0\/\*\*/);
    const { node, keys } = materializeWalletPolicy(parsed!, []);
    assert.equal(compileMiniscript(node), "multi(2,A,B)");
    assert.equal(keys[0]?.xpub, XPUB);
    assert.equal(keys[0]?.fingerprint.toLowerCase(), "deadbeef");
  });

  it("reads bitbox scriptConfig json", () => {
    const json = formatBitboxJson(
      compileBip388(compileStages([{ id: "s1", delay: 0, k: 1, keys: ["A"] }]).root, [keyA]).policy,
    );
    const parsed = parseWalletPolicy(json);
    assert.ok(parsed);
    assert.equal(parsed!.keys[0]?.fingerprint, "deadbeef");
    assert.equal(parsed!.keys[0]?.derivation, "48'/0'/0'/2'");
    const desc = walletPolicyToDescriptor(parsed!);
    assert.match(desc, /deadbeef/);
    assert.match(desc, /<0;1>\/\*/);
  });

  it("parses sortedmulti as multi with sorted flag", () => {
    const { node } = parseAny("wsh(sortedmulti(2,A,B,C))");
    assert.equal(node.kind, "multi");
    if (node.kind !== "multi") return;
    assert.equal(node.sorted, true);
    assert.equal(compileMiniscript(node), "sortedmulti(2,A,B,C)");
  });

  it("reads a bitbox xpub json onto a key slot", () => {
    const result = applyKeyMaterial(
      emptyKey("A"),
      JSON.stringify({ xpub: XPUB, keypath: "m/48'/0'/0'/2'", rootFingerprint: "aabbccdd" }),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.key.xpub, XPUB);
    assert.equal(result.key.fingerprint, "aabbccdd");
    assert.equal(result.key.derivation, "48'/0'/0'/2'");
  });
});

describe("hardware paths", () => {
  it("normalizes account paths", () => {
    assert.equal(defaultAccountPath("mainnet"), "m/48'/0'/0'/2'");
    assert.equal(defaultAccountPath("testnet", 1), "m/48'/1'/1'/2'");
    assert.equal(normalizeHwPath("48h/0h/0h/2h"), "m/48'/0'/0'/2'");
    assert.equal(pathToDerivation("m/48'/0'/0'/2'"), "48'/0'/0'/2'");
    assert.equal(
      formatOrigin("DEADBEEF", "m/48'/0'/0'/2'", XPUB),
      `[deadbeef/48'/0'/0'/2']${XPUB}`,
    );
  });

  it("demo session fills an origin xpub", async () => {
    const session = openDemoSession("ledger");
    const xpub = await session.getXpub("m/48'/0'/0'/2'");
    assert.equal(session.demo, true);
    assert.equal(xpub.fingerprint, "c0ffee01");
    assert.match(xpub.origin, /^\[c0ffee01\/48'\/0'\/0'\/2'\]xpub/);
    const applied = applyKeyMaterial(emptyKey("A"), xpub.origin);
    assert.equal(applied.ok, true);
    if (!applied.ok) return;
    assert.equal(applied.key.fingerprint, "c0ffee01");
    const hmac = await session.registerPolicy({
      name: "Scriptwerk",
      template: "wsh(pk(@0/**))",
      keys: [],
    });
    assert.equal(hmac.hmac, "demo");
  });
});
