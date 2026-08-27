#!/usr/bin/env node
/** Production host: Nitro node-server if built, else Vite preview. */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = String(process.env.PORT || process.env.NITRO_PORT || "8080");
const host = String(process.env.HOST || "0.0.0.0");
const env = { ...process.env, PORT: port, NITRO_PORT: port, HOST: host, NITRO_HOST: host };

const server = join(root, ".output/server/index.mjs");
const child = existsSync(server)
  ? spawn(process.execPath, [server], { cwd: root, env, stdio: "inherit" })
  : spawn(process.execPath, ["scripts/with-app-env.mjs", "vite", "preview", "--host", host, "--port", port], {
      cwd: root,
      env,
      stdio: "inherit",
    });

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
