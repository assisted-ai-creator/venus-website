/**
 * Module resolution for `node scripts/seed-cms.mjs`.
 *
 * Node can execute TypeScript directly (type stripping, 22.6+), but it does
 * not do TypeScript's module resolution: `./school` and `@/lib/site` both fail
 * because ESM requires a real file path. This hook adds the two rules the seed
 * needs — the `@/` alias, and extension inference for relative imports.
 */

import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";

const SRC = resolvePath(dirname(fileURLToPath(import.meta.url)), "..", "src");
const CANDIDATES = [".ts", ".tsx", "/index.ts", "/index.tsx", ".mjs", ".js"];

function firstThatExists(base) {
  if (existsSync(base) && !base.endsWith("/")) return base;
  for (const ext of CANDIDATES) {
    const candidate = base + ext;
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const found = firstThatExists(resolvePath(SRC, specifier.slice(2)));
    if (found) return next(pathToFileURL(found).href, context);
  }

  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
    const found = firstThatExists(base);
    if (found) return next(pathToFileURL(found).href, context);
  }

  return next(specifier, context);
}
