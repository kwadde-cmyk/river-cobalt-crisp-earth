import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checksumOf, coreCanonicalBody, descsumCheck, descsumCreate, stripChecksum } from "./checksum.ts";
import {
  compileDescriptor,
  compileMiniscript,
  descriptorOrderVariants,
  expandAliasKeys,
} from "./compile.ts";
import { explainPolicy } from "./explain.ts";
import {
  applyKeyMaterial,
  attachChildOrReplace,
  buildKeyTree,
  groupKeysByFingerprint,
  emptyKey,
  extractKeysFromTree,
  flattenKeysForLookup,
  formatBip32Path,
  formatKeyList,
  keyHeadline,
  keyNeedsAction,
  keyTileLabel,
  tokenNeedsAction,
  nextUnusedAccount,
  orderMasterNames,
  parseChildKey,
  parseKeyExpr,
  parseKeyList,
  relabelKeysFromA,
  sequentialKeyNames,
  sortKeyEntries,
} from "./keys.ts";
import { parseAny } from "./parser.ts";
import { compileStages, inferStages, permutations, stageFormula, stageHighlightIds, stageKeyOrderVariants } from "./stages.ts";
import {
  compileBip388,
  formatBitboxJson,
  formatLedgerJson,
  formatPolicyText,
  formatScriptwerkJson,
  materializeWalletPolicy,
  parseScriptwerkBundle,
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

describe("checksum", () => {
  it("matches BIP-380 and Bitcoin Core vectors", () => {
    assert.equal(descsumCreate("raw(deadbeef)").slice(-8), "89f8spxm");
    assert.equal(descsumCheck("raw(deadbeef)#89f8spxm"), true);
    assert.equal(
      descsumCreate("pkh(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)").slice(-8),
      "e48zzw02",
    );
  });

  it("gives Core a different checksum for the receive-only path", () => {
    const body = "wsh(pk([deadbeef/48'/0'/0'/2']xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5hqK5Gb4u1Q2ZbQW2kfykAPzh9RQQJwYvNUbaMhEaKfLUWuBvYJMTx5N/<0;1>/*))";
    const recv = coreCanonicalBody(body);
    assert.equal(recv.includes("/<0;1>/"), false);
    assert.equal(recv.includes("/0/"), true);
    assert.notEqual(checksumOf(body), checksumOf(recv));
    assert.equal(stripChecksum(descsumCreate(body)), body);
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

  it("roundtrips key display names in a list", () => {
    const line = formatKeyList([
      { ...emptyKey("A"), note: "Alice", fingerprint: "deadbeef", derivation: "48'/0'/0'/2'", xpub: XPUB },
    ]);
    assert.match(line, /Alice/);
    const list = parseKeyList(line);
    assert.equal(list?.[0]?.name, "A");
    assert.equal(list?.[0]?.note, "Alice");
    const quoted = parseKeyList(`B "Coldcard" [aabbccdd/48'/0'/0'/2']${XPUB}/<0;1>/*`);
    assert.equal(quoted?.[0]?.name, "B");
    assert.equal(quoted?.[0]?.note, "Coldcard");
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

  it("orders masters by stage then A–Z and relabels from A", () => {
    assert.deepEqual(sequentialKeyNames(3), ["A", "B", "C"]);
    const stages = [
      { keys: ["H", "F", "G"] },
      { keys: ["C", "A"] },
    ];
    assert.deepEqual(orderMasterNames(stages), ["F", "G", "H", "A", "C"]);
    const keys = ["H", "F", "G", "C", "A"].map((n) => emptyKey(n));
    const { node } = parseAny("or_i(and_v(v:pk(A),pk(C)),multi(2,F,G,H))");
    const labeled = relabelKeysFromA(keys, stages, node);
    assert.deepEqual(labeled.keys.map((k) => k.name), ["A", "B", "C", "D", "E"]);
    assert.deepEqual(labeled.stages[0]?.keys, ["A", "B", "C"]);
    assert.deepEqual(labeled.stages[1]?.keys, ["D", "E"]);
    assert.equal(compileMiniscript(labeled.root!), "or_i(and_v(v:pk(D),pk(E)),multi(2,A,B,C))");
    assert.deepEqual(
      sortKeyEntries(keys, stages).map((k) => k.name),
      ["F", "G", "H", "A", "C"],
    );
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
    const recovered = inferStages(root);
    assert.equal(recovered.length, 3);
    assert.equal(recovered[0]?.delay, 0);
    assert.equal(recovered[0]?.k, 2);
    assert.deepEqual(recovered[0]?.keys, ["A", "B", "C"]);
    assert.equal(recovered[1]?.delay, 60000);
    assert.deepEqual(recovered[1]?.keys, ["A", "D"]);
    assert.equal(recovered[2]?.delay, 65534);
    assert.deepEqual(recovered[2]?.keys, ["B", "C", "D"]);
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

  it("changes the checksum when multi keys are reordered, not when sorted", () => {
    assert.equal(permutations(["A", "B"]).length, 2);
    const stages = [{ id: "s1", delay: 0, k: 2, keys: ["A", "B", "C"] }];
    const keys = [
      { ...emptyKey("A"), xpub: XPUB, fingerprint: "aaaaaaa1", derivation: "48'/0'/0'/2'" },
      { ...emptyKey("B"), xpub: XPUB.replace("Bosf", "Bosg"), fingerprint: "bbbbbbb2", derivation: "48'/0'/0'/2'" },
      { ...emptyKey("C"), xpub: XPUB.replace("Bosf", "Bosh"), fingerprint: "ccccccc3", derivation: "48'/0'/0'/2'" },
    ];
    const variants = descriptorOrderVariants(stages, keys, true, 12);
    assert.ok(variants.length >= 2);
    assert.equal(new Set(variants.map((v) => v.checksum)).size, variants.length);
    const sorted = descriptorOrderVariants([{ ...stages[0]!, sorted: true }], keys, true, 12);
    assert.equal(sorted.length, 1);
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
    const recovered = inferStages(root);
    assert.equal(recovered.length, 2);
    assert.equal(recovered[0]?.delay, 0);
    assert.deepEqual(recovered[0]?.keys, ["A", "B"]);
    assert.equal(recovered[0]?.k, 2);
    assert.equal(recovered[1]?.delay, 144);
    assert.deepEqual(recovered[1]?.keys, ["A"]);
    assert.equal(recovered[1]?.k, 1);
    const parent = {
      ...emptyKey("A"),
      xpub: XPUB,
      fingerprint: "deadbeef",
      derivation: "48'/0'/0'/2'",
      children: [
        {
          id: "ck1",
          path: "48'/0'/1'/2'",
          xpub: "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw",
          fingerprint: "deadbeef",
          note: "A1",
        },
      ],
    };
    const expanded = expandAliasKeys(root, [parent, emptyKey("B")], false);
    const a1 = expanded.find((k) => k.name === "A1");
    assert.equal(a1?.derivation, "48'/0'/1'/2'");
    assert.ok(a1?.xpub.startsWith("xpub68Gmy"));
  });

  it("infers required key plus OR and delayed branches", () => {
    const { node } = parseAny(
      "or_i(and_v(v:multi(2,F,G,H),older(65534)),or_i(and_v(v:pk(D),and_v(v:pk(E),older(60000))),and_v(v:pk(A),or_d(pk(B),pk(C)))))",
    );
    const stages = inferStages(node);
    assert.equal(stages.length, 3);
    assert.equal(stages[0]?.delay, 0);
    assert.deepEqual(stages[0]?.keys, ["A", "B", "C"]);
    assert.deepEqual(stages[0]?.required, ["A"]);
    assert.equal(stages[0]?.k, 2);
    assert.equal(stageFormula(stages[0]!), "A + (B | C)");
    assert.equal(stages[1]?.delay, 60000);
    assert.deepEqual(stages[1]?.keys, ["D", "E"]);
    assert.deepEqual(stages[1]?.required, ["D", "E"]);
    assert.equal(stages[2]?.delay, 65534);
    assert.deepEqual(stages[2]?.keys, ["F", "G", "H"]);
    assert.equal(stages[2]?.k, 2);
    const hit = stageHighlightIds(node, stages, stages[0]!.id);
    assert.ok(hit.size >= 3);
    const miss = stageHighlightIds(node, stages, stages[2]!.id);
    assert.ok(miss.size >= 2);
    assert.notEqual(hit.size, miss.size);
  });

  it("highlights distinct compiled stage branches", () => {
    const stages = [
      { id: "s0", delay: 0, k: 2, keys: ["A", "B", "C"] },
      { id: "s1", delay: 52596, k: 2, keys: ["A", "B", "C", "D"] },
    ];
    const { root } = compileStages(stages, false);
    const a = stageHighlightIds(root, stages, "s0");
    const b = stageHighlightIds(root, stages, "s1");
    assert.ok(a.size >= 1);
    assert.ok(b.size >= 2);
    for (const id of a) assert.equal(b.has(id), false);
  });

  it("highlights a 1-key stage even without required[]", () => {
    const stages = [{ id: "solo", delay: 0, k: 1, keys: ["A"] }];
    const { root } = compileStages(stages, false);
    const hit = stageHighlightIds(root, stages, "solo");
    assert.ok(hit.has(root.id));
  });

  it("groups same-fingerprint keys as master and child", () => {
    const childXpub =
      "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw";
    const grouped = groupKeysByFingerprint([
      { ...emptyKey("A"), fingerprint: "deadbeef", derivation: "48'/0'/0'/2'", xpub: XPUB },
      { ...emptyKey("B"), fingerprint: "DEADBEEF", derivation: "48'/0'/1'/2'", xpub: childXpub },
      { ...emptyKey("C"), fingerprint: "aaaaaaaa", derivation: "48'/0'/0'/2'", xpub: XPUB.replace("Bosf", "Bosz") },
    ]);
    assert.equal(grouped.keys.length, 2);
    const master = grouped.keys.find((k) => k.name === "A");
    assert.ok(master);
    assert.equal(master!.children.length, 1);
    assert.equal(master!.children[0]?.path, "48'/0'/1'/2'");
    assert.equal(grouped.rename.get("B"), "A1");
    assert.equal(grouped.keys.some((k) => k.name === "B"), false);
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

  it("transports key labels through policy text and scriptwerk json", () => {
    const { root } = compileStages([{ id: "s1", delay: 0, k: 2, keys: ["A", "B"] }]);
    const keys = [
      { ...keyA, note: "Alice" },
      { ...keyB, note: "Bob" },
    ];
    const compiled = compileBip388(root, keys);
    assert.equal(compiled.policy.keys[0]?.label, "Alice");
    const text = formatPolicyText(compiled.policy);
    assert.match(text, /Alice/);
    const parsed = parseWalletPolicy(text);
    assert.equal(parsed?.keys[0]?.label, "Alice");
    const { keys: restored } = materializeWalletPolicy(parsed!, []);
    assert.equal(restored.find((k) => k.xpub === XPUB)?.note, "Alice");
    const json = formatScriptwerkJson({
      miniscript: compileMiniscript(root),
      descriptor: "wsh(multi(2,A,B))",
      keys,
      reuseKeys: false,
      network: "mainnet",
    });
    const bundle = parseScriptwerkBundle(json);
    assert.equal(bundle?.keys[0]?.note, "Alice");
    assert.equal(bundle?.keys[1]?.note, "Bob");
  });

  it("keeps child accounts on the same fingerprint instead of new letters", () => {
    const childXpub =
      "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw";
    const other =
      "xpub6CohzjsqMhyQdTzBsHR41w1SFdGxPAjxCBJYPcvwx8Am2xFevsXJt1GcKS5epVSvAYhpSNiNqo86nLNBhYkY4SXL1MQeDkZgtR4xL1V4uRn";
    const { root } = compileStages(
      [
        { id: "s0", delay: 0, k: 2, keys: ["A", "B"] },
        { id: "s1", delay: 144, k: 1, keys: ["A1"] },
      ],
      false,
    );
    const keys = [
      {
        ...keyA,
        note: "Alice",
        children: [
          { id: "ck1", path: "48'/0'/1'/2'", xpub: childXpub, fingerprint: "deadbeef", note: "A1" },
        ],
      },
      { ...keyB, note: "Bob", fingerprint: "cafebabe", xpub: other, derivation: "48'/0'/0'/2'" },
    ];
    const compiled = compileDescriptor(root, keys, false);
    assert.equal(compiled.ok, true);
    const parsed = parseAny(compiled.descriptor);
    const extracted = extractKeysFromTree(parsed.node, flattenKeysForLookup(keys));
    assert.equal(compileMiniscript(extracted.node), compileMiniscript(root));
    const a = extracted.keys.find((k) => k.name === "A");
    const a1 = extracted.keys.find((k) => k.name === "A1");
    const b = extracted.keys.find((k) => k.name === "B");
    assert.equal(a?.note, "Alice");
    assert.equal(a?.xpub, XPUB);
    assert.equal(a1?.xpub, childXpub);
    assert.equal(b?.note, "Bob");
  });

  it("maps policy-text labels by xpub even if @ order differs from tree order", () => {
    const { root } = compileStages(
      [
        { id: "late", delay: 0, k: 1, keys: ["B"] },
        { id: "early", delay: 144, k: 1, keys: ["A"] },
      ],
      false,
    );
    const keys = [
      { ...keyA, note: "Alice" },
      { ...keyB, note: "Bob" },
    ];
    const compiled = compileBip388(root, keys, "Scriptwerk", false);
    const text = formatPolicyText(compiled.policy);
    const parsed = parseWalletPolicy(text);
    const { node, keys: restored } = materializeWalletPolicy(parsed!, []);
    const alice = restored.find((k) => k.note === "Alice");
    const bob = restored.find((k) => k.note === "Bob");
    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice!.xpub, XPUB);
    assert.equal(bob!.xpub, keyB.xpub);
    assert.match(compileMiniscript(node), /A/);
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
