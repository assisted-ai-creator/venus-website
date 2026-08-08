/**
 * Minimal ambient declarations for the Cloudflare bindings this project uses.
 *
 * `@cloudflare/workers-types` is deliberately not installed: it conflicts with
 * this app's peer tree, and importing it globally redeclares DOM lib globals
 * that Next's client components rely on. Only the D1 surface the enquiry route
 * touches is declared here, so the types stay accurate and narrow.
 *
 * If the project later needs the full binding set, replace this file with the
 * generated one: `npm run cf:typegen`.
 */

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}
