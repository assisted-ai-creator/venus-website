/**
 * Seeds the CMS with the site as it stands in this repo.
 *
 * The typed content layer in `src/content` is both the website's offline
 * fallback and the panel's starting point, so this posts it to the API once —
 * after which the school edits it there, and this script is only needed again
 * to re-seed a fresh database.
 *
 *   npm run cms:seed              # fill gaps only, safe to re-run
 *   npm run cms:seed -- --replace # wipe existing content first
 *
 * Reads CMS_API_URL and CMS_BOOTSTRAP_TOKEN from the environment or .env.local.
 * Needs Node 22.6+ — the seed is TypeScript, run through native type stripping.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { register } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------ env --- */

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const API = (process.env.CMS_API_URL ?? "").replace(/\/+$/, "");
const TOKEN = process.env.CMS_BOOTSTRAP_TOKEN ?? "";
const mode = process.argv.includes("--replace") ? "replace" : "missing";

if (!API) {
  console.error(
    "CMS_API_URL is not set.\n" +
      "Add it to .env.local, for example:\n" +
      "  CMS_API_URL=https://venus-admin-api.<your-subdomain>.workers.dev"
  );
  process.exit(1);
}
if (!TOKEN) {
  console.error(
    "CMS_BOOTSTRAP_TOKEN is not set.\n" +
      "It must match the secret set on the API with:\n" +
      "  wrangler secret put BOOTSTRAP_TOKEN"
  );
  process.exit(1);
}

/* ----------------------------------------------------------- the payload --- */

register("./ts-loader.mjs", import.meta.url);

let SEED_PAYLOAD;
try {
  ({ SEED_PAYLOAD } = await import(pathToFileURL(resolve(root, "src/content/seed.ts")).href));
} catch (err) {
  console.error(
    `Could not load src/content/seed.ts.\n` +
      `TypeScript type stripping needs Node 22.6 or newer; this is ${process.version}.`
  );
  console.error(err);
  process.exit(1);
}

const payload = { ...SEED_PAYLOAD, mode };

console.log(`Seeding ${API} (mode: ${mode})`);
console.log(
  `  ${payload.pages.length} pages · ${payload.albums.length} albums · ` +
    `${payload.media.length} photographs · ${Object.keys(payload.settings).length} settings documents`
);

/* -------------------------------------------------------------- transmit --- */

const res = await fetch(`${API}/v1/seed`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-bootstrap-token": TOKEN },
  body: JSON.stringify(payload),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`\nSeeding failed (${res.status}): ${body.error ?? "unknown error"}`);
  if (body.issues) console.error(JSON.stringify(body.issues, null, 2));
  process.exit(1);
}

console.log("\nDone.");
console.log(`  written: ${JSON.stringify(body.report)}`);
console.log(`  snapshot version: ${body.version}`);
console.log("\nOpen /admin on the website to sign in and start editing.");
