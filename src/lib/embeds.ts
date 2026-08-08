/**
 * Embedded film and reel addresses.
 *
 * The school pastes whatever the share button gave it — a youtu.be link, a
 * Shorts link, an Instagram reel with a tracking query on the end — and this
 * works out what it is. Nobody in the office should have to know what a video
 * id is, which is why the panel asks for an address rather than an id.
 *
 * Only YouTube and Instagram are recognised. An address from anywhere else is
 * returned as `null` and the block prints a plain link instead of framing a
 * page nobody has vetted.
 */

export type EmbedProvider = "youtube" | "instagram";

export interface Embed {
  provider: EmbedProvider;
  /** Video id, or the reel/post shortcode. */
  id: string;
  /** The address to put in the iframe. */
  src: string;
  /** Where the thing lives, for the caption link and the no-frame fallback. */
  href: string;
  /** Reels are portrait; films and posts are not. */
  shape: "landscape" | "portrait";
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "instagr.am",
  "www.instagr.am",
]);

/** YouTube ids are 11 characters of url-safe base64. */
const YOUTUBE_ID = /^[\w-]{11}$/;
/** Instagram shortcodes are url-safe base64 too, but not a fixed length. */
const INSTAGRAM_CODE = /^[\w-]{5,32}$/;

function youtube(id: string): Embed | null {
  if (!YOUTUBE_ID.test(id)) return null;
  return {
    provider: "youtube",
    id,
    // The no-cookie host, so a reader who never presses play is not counted.
    src: `https://www.youtube-nocookie.com/embed/${id}`,
    href: `https://www.youtube.com/watch?v=${id}`,
    shape: "landscape",
  };
}

function instagram(kind: string, code: string): Embed | null {
  if (!INSTAGRAM_CODE.test(code)) return null;
  // `reels` is what the app's share sheet writes; the embed path wants `reel`.
  const path = kind === "reels" ? "reel" : kind;
  return {
    provider: "instagram",
    id: code,
    src: `https://www.instagram.com/${path}/${code}/embed/`,
    href: `https://www.instagram.com/${path}/${code}/`,
    shape: path === "reel" ? "portrait" : "landscape",
  };
}

/**
 * Reads an address, a bare YouTube id, or an empty string.
 *
 * Returns `null` for anything it does not recognise — including an address on
 * a host that merely looks like one of these, which is why the host is matched
 * against a set rather than with `endsWith`.
 */
export function parseEmbed(input: string): Embed | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  // A bare id, which is what the older video block stored.
  if (YOUTUBE_ID.test(raw)) return youtube(raw);

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (YOUTUBE_HOSTS.has(host)) {
    // youtu.be/<id>
    if (host.endsWith("youtu.be")) return youtube(parts[0] ?? "");

    const v = url.searchParams.get("v");
    if (v) return youtube(v);

    // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
    if (parts.length >= 2 && ["embed", "shorts", "live", "v"].includes(parts[0])) {
      return youtube(parts[1]);
    }
    return null;
  }

  if (INSTAGRAM_HOSTS.has(host)) {
    // /reel/<code>, /reels/<code>, /p/<code>, /tv/<code>, and the same again
    // under a profile: /<user>/reel/<code>.
    const at = parts.findIndex((p) => ["reel", "reels", "p", "tv"].includes(p));
    if (at === -1 || !parts[at + 1]) return null;
    return instagram(parts[at], parts[at + 1]);
  }

  return null;
}
