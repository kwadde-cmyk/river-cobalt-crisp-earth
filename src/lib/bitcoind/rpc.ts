import { checksumOf, coreCanonicalBody, stripChecksum } from "../miniscript/checksum.ts";
import { rewriteSortedMultiForCore } from "../miniscript/compile.ts";

export interface BitcoindConfig {
  url: string;
  username: string;
  password: string;
}

export interface NodeProbe {
  subversion: string;
  version: number;
  chain: string;
  blocks: number;
}

export interface NodeValidateResult {
  descriptor: string;
  checksum: string;
  exportChecksum: string;
  checksumNote: "match" | "receive" | "differ";
  isrange: boolean;
  issolvable: boolean;
  hasprivatekeys: boolean;
  addresses: string[];
  deriveError?: string;
}

type RpcOk = { result: unknown; error: null };
type RpcErr = { result: null; error: { code: number; message: string } };

export function defaultRpcPort(network: "mainnet" | "testnet" = "mainnet"): number {
  return network === "testnet" ? 18332 : 8332;
}

export function normalizeRpcUrl(raw: string, network: "mainnet" | "testnet" = "mainnet"): string {
  const fallback = `http://127.0.0.1:${defaultRpcPort(network)}`;
  try {
    const text = raw.trim().replace(/^['"<]+|[>'"]+$/g, "");
    if (!text) return fallback;
    const embedded = text.match(/https?:\/\/[^\s<>"'`\\]+/i)?.[0];
    if (embedded) {
      const u = new URL(embedded.replace(/[),.;]+$/g, ""));
      if (u.protocol === "http:" || u.protocol === "https:") {
        const path = u.pathname === "/" ? "" : u.pathname.replace(/\/+$/, "");
        return `${u.origin}${path}`;
      }
    }
    const token = (text.split(/\s+/)[0] ?? "").replace(/\/+$/, "");
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(token)) {
      const rest = token.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
      return rest ? normalizeRpcUrl(rest, network) : fallback;
    }
    const host = token.replace(/^\/+/, "");
    if (!host) return fallback;
    const withScheme = /:\d+$/.test(host) ? `http://${host}` : `http://${host}:${defaultRpcPort(network)}`;
    return new URL(withScheme).origin;
  } catch {
    return fallback;
  }
}

export function splitCookie(user: string, pass: string): { username: string; password: string } {
  const u = user.trim();
  const p = pass.trim();
  if (p) return { username: u, password: p };
  const m = u.match(/^([^:]+):(.+)$/s);
  if (m) return { username: m[1]!.trim(), password: m[2]!.trim() };
  return { username: u, password: p };
}

export function basicToken(user: string, pass: string): string {
  const raw = `${user}:${pass}`;
  if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf8").toString("base64");
  const bytes = new TextEncoder().encode(raw);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function looksLikeStartos(url: string): boolean {
  const text = url.trim().toLowerCase();
  if (text.includes(".local")) return true;
  try {
    const u = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
    const port = u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 80;
    const ip = /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname);
    if (u.protocol === "https:" && ip && port !== 443 && port !== 8332 && port !== 18332) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isLanIpUrl(url: string): boolean {
  try {
    const raw = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(new URL(raw).hostname);
  } catch {
    return false;
  }
}

export function addressSpace(url: string): "local" | "loopback" {
  try {
    const host = new URL(/^https?:\/\//i.test(url) ? url : `http://${url}`).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1") {
      return "loopback";
    }
  } catch {
    /* ignore */
  }
  return "local";
}

export async function nodeFetch(url: string, init: RequestInit): Promise<Response> {
  const space = addressSpace(url);
  const opts = { ...init, targetAddressSpace: space } as RequestInit;
  try {
    return await fetch(url, opts);
  } catch (first) {
    if (space === "local") {
      try {
        return await fetch(url, { ...init, targetAddressSpace: "private" } as RequestInit);
      } catch {
        throw first;
      }
    }
    throw first;
  }
}

function classifyFetchError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/abort|timeout/i.test(msg)) return new Error("node.err.unreachable");
  return new Error("node.err.blocked");
}

export async function jsonRpcDirect(
  config: BitcoindConfig,
  method: string,
  params: unknown[] = [],
): Promise<unknown> {
  const url = /^https?:\/\//i.test(config.url.trim())
    ? config.url.trim().replace(/\/+$/, "")
    : normalizeRpcUrl(config.url);
  const auth = splitCookie(config.username, config.password);
  const payload = JSON.stringify({ jsonrpc: "1.0", id: "scriptwerk", method, params });
  const token = basicToken(auth.username, auth.password);
  const headerSets: Record<string, string>[] = [
    { "Content-Type": "application/json", Authorization: `Basic ${token}` },
    { "Content-Type": "text/plain", Authorization: `Basic ${token}` },
  ];
  let lastErr: unknown;
  let res: Response | null = null;
  for (const headers of headerSets) {
    try {
      res = await nodeFetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        headers,
        body: payload,
        signal: AbortSignal.timeout(15000),
      });
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!res) throw classifyFetchError(lastErr);

  if (res.status === 401) throw new Error("node.err.auth");
  const body = (await res.json().catch(() => null)) as RpcOk | RpcErr | null;
  if (!body) throw new Error("node.err.http");
  if (body.error) throw new Error(body.error.message || `RPC ${body.error.code}`);
  return body.result;
}

export async function jsonRpc(
  config: BitcoindConfig,
  method: string,
  params: unknown[] = [],
): Promise<unknown> {
  const { isBridgeOn, rpcViaBridge } = await import("./bridge.ts");
  if (isBridgeOn()) return rpcViaBridge(method, params);
  if (await hostProxyAvailable()) return rpcViaHost(method, params, config);
  try {
    return await jsonRpcDirect(config, method, params);
  } catch (e) {
    if (!isBridgeOn()) throw e;
    return rpcViaBridge(method, params);
  }
}

let hostProxyMemo: boolean | null = null;

export async function hostProxyAvailable(): Promise<boolean> {
  if (typeof fetch === "undefined") return false;
  if (hostProxyMemo != null) return hostProxyMemo;
  try {
    const res = await fetch("/bitcoind-rpc", { method: "GET", cache: "no-store" });
    hostProxyMemo = res.status === 204;
  } catch {
    hostProxyMemo = false;
  }
  return hostProxyMemo;
}

export async function hostProxyInfo(): Promise<{
  configured: boolean;
  url: string;
  user: string;
  password: string;
  source: string;
  locked: boolean;
} | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch("/bitcoind-rpc/info", { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      configured?: boolean;
      url?: string;
      user?: string;
      password?: string;
      source?: string;
      locked?: boolean;
    };
    if (!body?.configured) return null;
    return {
      configured: true,
      url: body.url ?? "",
      user: body.user ?? "",
      password: body.password ?? "",
      source: body.source ?? "env",
      locked: Boolean(body.locked),
    };
  } catch {
    return null;
  }
}

async function rpcViaHost(method: string, params: unknown[], config: BitcoindConfig): Promise<unknown> {
  const info = await hostProxyInfo();
  const auth = splitCookie(config.username, config.password);
  const res = await fetch("/bitcoind-rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      method,
      params,
      ...(info?.locked ? {} : { auth: { user: auth.username, pass: auth.password } }),
    }),
  });
  if (res.status === 401) throw new Error("node.err.auth");
  const body = (await res.json().catch(() => null)) as RpcOk | RpcErr | null;
  if (!body) throw new Error("node.err.http");
  if (body.error) throw new Error(body.error.message || `RPC ${body.error.code}`);
  return body.result;
}

const VALID_PROBE_DESC =
  "pkh(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)";

export async function probeNode(config: BitcoindConfig): Promise<NodeProbe> {
  if (typeof navigator !== "undefined" && navigator.permissions?.query) {
    try {
      await navigator.permissions.query({ name: "local-network-access" as PermissionName });
    } catch {
      /* older browsers */
    }
  }
  try {
    const net = (await jsonRpc(config, "getnetworkinfo")) as {
      subversion?: string;
      version?: number;
    };
    let chain = "";
    let blocks = 0;
    const extra = await probeChain(config);
    chain = extra.chain;
    blocks = extra.blocks;
    return {
      subversion: net.subversion || "",
      version: net.version || 0,
      chain,
      blocks,
    };
  } catch (first) {
    try {
      await jsonRpc(config, "getdescriptorinfo", [VALID_PROBE_DESC]);
      return {
        subversion: looksLikeStartos(config.url) ? "/Satoshi:31.1.0/" : "",
        version: 0,
        chain: "",
        blocks: 0,
      };
    } catch {
      throw first;
    }
  }
}

async function probeChain(config: BitcoindConfig): Promise<{ chain: string; blocks: number }> {
  try {
    const info = (await jsonRpc(config, "getblockchaininfo")) as { chain?: string; blocks?: number };
    return { chain: info.chain || "", blocks: info.blocks || 0 };
  } catch {
    /* rpcwhitelist */
  }
  try {
    const mine = (await jsonRpc(config, "getmininginfo")) as { chain?: string; blocks?: number };
    return { chain: mine.chain || "", blocks: mine.blocks || 0 };
  } catch {
    /* rpcwhitelist */
  }
  try {
    const n = await jsonRpc(config, "getblockcount");
    if (typeof n === "number") return { chain: "", blocks: n };
  } catch {
    /* rpcwhitelist */
  }
  return { chain: "", blocks: 0 };
}

export async function validateOnNode(
  config: BitcoindConfig,
  descriptor: string,
): Promise<NodeValidateResult> {
  const payload = rewriteSortedMultiForCore(stripChecksum(descriptor));
  const exportChecksum = checksumOf(payload);
  const info = (await jsonRpc(config, "getdescriptorinfo", [payload])) as {
    descriptor: string;
    checksum: string;
    isrange: boolean;
    issolvable: boolean;
    hasprivatekeys: boolean;
  };
  const coreDesc = info.descriptor || payload;
  const coreCs = checksumOf(coreDesc) || info.checksum;
  const inputCs = info.checksum || exportChecksum;
  const coreBody = stripChecksum(coreDesc);
  const algoOk = inputCs === exportChecksum || coreCs === exportChecksum;
  const sameBody = coreBody === payload;
  let checksumNote: NodeValidateResult["checksumNote"] = "differ";
  if (sameBody && algoOk) checksumNote = "match";
  else if (algoOk || coreBody === coreCanonicalBody(payload)) checksumNote = "receive";
  let addresses: string[] = [];
  let deriveError: string | undefined;
  try {
    const desc = info.descriptor || payload;
    addresses = await deriveSample(config, desc, Boolean(info.isrange));
  } catch (e) {
    deriveError = e instanceof Error ? e.message : "node.err.derive";
  }
  return {
    descriptor: coreDesc,
    checksum: coreCs,
    exportChecksum,
    checksumNote,
    isrange: Boolean(info.isrange),
    issolvable: Boolean(info.issolvable),
    hasprivatekeys: Boolean(info.hasprivatekeys),
    addresses,
    deriveError,
  };
}

async function deriveSample(config: BitcoindConfig, desc: string, isrange: boolean): Promise<string[]> {
  const candidates = [desc];
  if (desc.includes("/<0;1>/")) candidates.push(desc.replaceAll("/<0;1>/", "/0/"));
  let last: unknown;
  for (const d of candidates) {
    try {
      const raw = isrange || d.includes("/*")
        ? await jsonRpc(config, "deriveaddresses", [d, [0, 2]])
        : await jsonRpc(config, "deriveaddresses", [d]);
      if (Array.isArray(raw)) return raw.map(String);
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error("node.err.derive");
}
