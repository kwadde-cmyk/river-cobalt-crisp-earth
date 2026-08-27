import type { DiagReport } from "./diagnose.ts";

type Pending = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
};

let target: Window | null = null;
let targetOrigin = "";
let auth = { user: "", pass: "" };
const pending = new Map<number, Pending>();
let seq = 1;

export function corsBlocked(report: DiagReport): boolean {
  const reachOk = report.steps.some((s) => s.id === "reach" && s.status === "ok");
  const rpcFail = report.steps.some((s) => s.id === "rpc" && s.status === "fail");
  const corsFail = report.steps.some(
    (s) => (s.id === "corsGet" || s.id === "preflight") && (s.status === "fail" || s.status === "skip"),
  );
  return reachOk && rpcFail && corsFail;
}

export function originOf(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

export function isBridgeOn(): boolean {
  return Boolean(target && !target.closed);
}

export function dropBridge(): void {
  target = null;
  targetOrigin = "";
  auth = { user: "", pass: "" };
  for (const p of pending.values()) p.reject(new Error("node.err.bridgeGone"));
  pending.clear();
}

export function rpcViaBridge(method: string, params: unknown[] = []): Promise<unknown> {
  if (!target || target.closed) return Promise.reject(new Error("node.err.bridgeGone"));
  const id = seq++;
  const win = target;
  const dest = targetOrigin;
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("node.err.unreachable"));
    }, 15000);
    pending.set(id, {
      resolve: (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      reject: (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    });
    win.postMessage({ type: "scriptwerk-rpc", id, method, params, auth }, dest);
  });
}

export function bridgeScript(parentOrigin: string): string {
  return `(function(){var P=${JSON.stringify(parentOrigin)};var rpc=(location.href||"").split("#")[0].replace(/\\/$/,"")||(location.origin+"/");function go(d,w){try{(w||window.opener||window.parent).postMessage(d,P);}catch(e){}}function paint(){try{document.title="Scriptwerk-Bruecke";var s="font-family:system-ui,sans-serif;background:#0b0c0e;color:#e8e6e3;padding:32px;max-width:36rem;line-height:1.45";document.body.setAttribute("style",s);document.body.innerHTML="<h1 style=\\"font-size:1.35rem;margin:0 0 12px\\">Scriptwerk-Brücke aktiv</h1><p>Diesen Tab offen lassen und zurück zu Scriptwerk gehen.</p><p style=\\"color:#9a9590\\">Die Meldung <code>JSONRPC server handles only POST requests</code> war nur ein GET. bitcoind spricht ausschließlich POST — das übernimmt diese Brücke.</p>";}catch(e){}}window.addEventListener("message",function(e){if(e.origin!==P||!e.data||e.data.type!=="scriptwerk-rpc")return;var h={"Content-Type":"application/json"};if(e.data.auth&&e.data.auth.user)h.Authorization="Basic "+btoa(e.data.auth.user+":"+e.data.auth.pass);fetch(rpc,{method:"POST",headers:h,body:JSON.stringify({jsonrpc:"1.0",id:e.data.id,method:e.data.method,params:e.data.params||[]}),credentials:"include"}).then(function(r){return r.json();}).then(function(json){e.source.postMessage({type:"scriptwerk-rpc-result",id:e.data.id,json:json},P);}).catch(function(err){e.source.postMessage({type:"scriptwerk-rpc-result",id:e.data.id,error:String(err)},P);});});paint();go({type:"scriptwerk-bridge-ready",origin:location.origin});})();`;
}

export function bookmarkletHref(parentOrigin: string): string {
  return `javascript:${encodeURIComponent(bridgeScript(parentOrigin))}`;
}

export function openNodeTab(url: string): Window | null {
  return window.open(url, "scriptwerk-node");
}

export function watchBridge(
  expectedOrigin: string,
  creds: { user: string; pass: string },
  onReady: () => void,
): () => void {
  targetOrigin = expectedOrigin;
  auth = { user: creds.user, pass: creds.pass };
  const onMsg = (e: MessageEvent) => {
    if (e.origin !== expectedOrigin) return;
    const data = e.data as {
      type?: string;
      id?: number;
      json?: { result?: unknown; error?: { message?: string } };
      error?: string;
    } | null;
    if (!data || typeof data !== "object") return;
    if (data.type === "scriptwerk-bridge-ready" && e.source) {
      target = e.source as Window;
      target.postMessage({ type: "scriptwerk-hello", auth }, expectedOrigin);
      onReady();
      return;
    }
    if (data.type !== "scriptwerk-rpc-result" || data.id == null) return;
    const wait = pending.get(data.id);
    if (!wait) return;
    pending.delete(data.id);
    if (data.error) wait.reject(new Error(data.error));
    else if (data.json?.error?.message) wait.reject(new Error(data.json.error.message));
    else wait.resolve(data.json?.result);
  };
  window.addEventListener("message", onMsg);
  return () => window.removeEventListener("message", onMsg);
}
