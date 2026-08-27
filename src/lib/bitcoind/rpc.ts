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
  const text = raw.trim();
  if (!text) return `http://127.0.0.1:${defaultRpcPort(network)}`;
  if (/^https?:\/\//i.test(text)) return text.replace(/\/+$/, "");
  if (text.includes("://")) throw new Error("node.err.url");
  const host = text.replace(/\/+$/, "");
  if (/:\d+$/.test(host)) return `http://${host}`;
  return `http://${host}:${defaultRpcPort(network)}`;
}

export function splitCookie(user: string, pass: string): { username: string; password: string } {
  if (pass.trim()) return { username: user, password: pass };
  const m = user.trim().match(/^([^:]+):(.+)$/);
  if (m) return { username: m[1]!, password: m[2]! };
  return { username: user, password: pass };
}

function basicToken(user: string, pass: string): string {
  const raw = `${user}:${pass}`;
  if (typeof btoa === "function") return btoa(raw);
  return Buffer.from(raw, "utf8").toString("base64");
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
  try {
    return await jsonRpcDirect(config, method, params);
  } catch (e) {
    if (!isBridgeOn()) throw e;
    return rpcViaBridge(method, params);
  }
}

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
    const chain = (await jsonRpc(config, "getblockchaininfo")) as {
      chain?: string;
      blocks?: number;
    };
    return {
      subversion: net.subversion || "",
      version: net.version || 0,
      chain: chain.chain || "",
      blocks: chain.blocks || 0,
    };
  } catch {
    await jsonRpc(config, "getdescriptorinfo", ["pkh(02" + "11".repeat(32) + ")"]);
    return {
      subversion: looksLikeStartos(config.url) ? "/StartOS/" : "",
      version: 0,
      chain: "",
      blocks: 0,
    };
  }
}

export async function validateOnNode(
  config: BitcoindConfig,
  descriptor: string,
): Promise<NodeValidateResult> {
  const info = (await jsonRpc(config, "getdescriptorinfo", [descriptor])) as {
    descriptor: string;
    checksum: string;
    isrange: boolean;
    issolvable: boolean;
    hasprivatekeys: boolean;
  };
  let addresses: string[] = [];
  let deriveError: string | undefined;
  try {
    const desc = info.descriptor || descriptor;
    const raw = info.isrange
      ? await jsonRpc(config, "deriveaddresses", [desc, [0, 2]])
      : await jsonRpc(config, "deriveaddresses", [desc]);
    if (Array.isArray(raw)) addresses = raw.map(String);
  } catch (e) {
    deriveError = e instanceof Error ? e.message : "node.err.derive";
  }
  return {
    descriptor: info.descriptor,
    checksum: info.checksum,
    isrange: Boolean(info.isrange),
    issolvable: Boolean(info.issolvable),
    hasprivatekeys: Boolean(info.hasprivatekeys),
    addresses,
    deriveError,
  };
}
