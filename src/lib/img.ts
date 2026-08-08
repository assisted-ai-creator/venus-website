/**
 * Resolves a photograph to its thumbnail derivative.
 *
 * Grid cards and album covers draw at ~400 CSS px, so they use the 800px
 * thumbnails written by `scripts/optimise-photos.mjs` rather than the 1600px
 * masters. Lightboxes, the hero slider and the programme plates keep the
 * master, because they are drawn large.
 */
export function thumb(src: string): string {
  if (!src.startsWith("/photos/") || src.startsWith("/photos/thumbs/")) return src;
  return src.replace("/photos/", "/photos/thumbs/").replace(/\.png$/i, ".jpg");
}
