"use client";

/**
 * The panel's client for `/api/admin/*`.
 *
 * Nothing here knows the API's address or holds a token — the proxy on this
 * origin attaches the session from an HttpOnly cookie. A 401 anywhere means
 * the session has gone, so the caller is bounced to the sign-in screen rather
 * than left staring at an empty list.
 */

export class ApiError extends Error {
  status: number;
  payload: Record<string, unknown>;

  constructor(status: number, message: string, payload: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const BASE = "/api/admin";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "content-type": "application/json" }),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let payload: Record<string, unknown> = {};
  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = { error: text.slice(0, 300) };
    }
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.endsWith("/admin/login")) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(res.status, String(payload.error ?? `Request failed (${res.status})`), payload);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

/* --------------------------------------------------------------- shapes --- */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "editor";
}

export interface MediaItem {
  id: string;
  key: string;
  url: string;
  filename: string;
  mime: string;
  kind: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string;
  createdAt: number;
}

export interface AdminSection {
  id: string;
  type: string;
  label: string;
  data: Record<string, unknown>;
  position: number;
  enabled: boolean;
}

export interface AdminPage {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  seo: Record<string, unknown>;
  header: Record<string, unknown>;
  position: number;
  status: string;
  showInNav: boolean;
  isSystem: boolean;
  updatedAt: number;
  sections: AdminSection[];
  sectionCount?: number;
}

export interface AdminAlbum {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  coverMediaId: string | null;
  cover: string;
  coverAlt: string;
  status: string;
  photos: MediaItem[];
  photoCount?: number;
}

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  bodyHtml?: string;
  coverMediaId: string | null;
  cover: string;
  author: string;
  tags: string[];
  seo: Record<string, unknown>;
  status: string;
  publishedAt: number | null;
  updatedAt: number;
}

export interface AdminNotice {
  id: string;
  title: string;
  kind: string;
  body: string;
  /** ISO yyyy-mm-dd, or empty. */
  date: string;
  href: string;
  fileMediaId: string | null;
  file: { url: string; filename: string; mime: string; size: number } | null;
  pinned: boolean;
  status: string;
  /** ISO yyyy-mm-dd, or empty for a notice that never lapses. */
  expiresOn: string;
  updatedAt: number;
}

export interface Enquiry {
  id: number;
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  seekingClass: string;
  message: string;
  createdAt: number;
  handled: boolean;
}

export interface IpPolicy {
  enabled: boolean;
  allow: string[];
  note?: string;
}
