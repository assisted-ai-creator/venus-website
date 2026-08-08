/**
 * Downscales and recompresses everything in public/photos.
 *
 * Parents reach this site on mid-range Android phones on mobile data, so the
 * originals coming off a camera (up to 4000px and 1.4 MB each) are not
 * shippable. Nothing on the site is displayed larger than ~1200 CSS px on its
 * long edge, so 1600 on the long edge is generous and still covers 2x on a
 * phone. The cap is on the long edge, not the width: capping width alone leaves
 * a portrait photo at 1600x2133, heavier than any landscape shot.
 *
 * Idempotent: a manifest records the byte size of each file after optimisation,
 * and any file still at that size is skipped, so repeated runs never
 * recompress an already-processed photograph. Drop a new photo into the folder
 * and re-run — only the new one is touched.
 *
 *   node scripts/optimise-photos.mjs
 */
import sharp from "sharp";
import { readdir, stat, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const DIR = "public/photos";
const MAX_EDGE = 1600;
const QUALITY = 72;
/** Below this, recompression buys nothing worth the quality loss. */
const SKIP_UNDER_BYTES = 90 * 1024;

const MANIFEST = join(DIR, ".optimised.json");

const files = (await readdir(DIR)).filter((f) =>
  [".jpg", ".jpeg", ".png"].includes(extname(f).toLowerCase())
);

/** filename -> byte size recorded after the last successful optimisation. */
let manifest = {};
try {
  manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
} catch {
  // First run, or the manifest was removed to force a full re-optimisation.
}

let before = 0;
let after = 0;
let touched = 0;

for (const file of files) {
  const path = join(DIR, file);
  const { size } = await stat(path);
  before += size;

  // Already optimised on a previous run and untouched since.
  if (manifest[file] === size) {
    after += size;
    continue;
  }

  // Read into memory first: sharp keeps the source handle open, and on Windows
  // that blocks writing back to the same path.
  const source = await readFile(path);
  const meta = await sharp(source).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const needsResize = longEdge > MAX_EDGE;

  if (!needsResize && size < SKIP_UNDER_BYTES) {
    manifest[file] = size;
    after += size;
    continue;
  }

  const isPng = extname(file).toLowerCase() === ".png";
  let pipeline = sharp(source).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  pipeline = isPng
    ? pipeline.png({ compressionLevel: 9, palette: true })
    : pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true });

  const out = await pipeline.toBuffer();

  // Never write a bigger file than we started with.
  if (out.length >= size) {
    manifest[file] = size;
    after += size;
    continue;
  }

  await writeFile(path, out);
  manifest[file] = out.length;
  after += out.length;
  touched++;
  console.log(
    `  ${file.padEnd(28)} ${(size / 1024).toFixed(0).padStart(5)} KB -> ${(
      out.length / 1024
    )
      .toFixed(0)
      .padStart(5)} KB`
  );
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));

const mb = (n) => (n / 1048576).toFixed(2);
console.log(
  `\n${touched} of ${files.length} rewritten. ${mb(before)} MB -> ${mb(after)} MB ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`
);

/* --------------------------------------------------------------------------
 * Thumbnails.
 *
 * Grid cards and album covers are never drawn wider than ~400 CSS px, so
 * serving them the 1600px master wastes most of the bytes. These derivatives
 * live in public/photos/thumbs/ under the same filename, which is what
 * `thumb()` in src/lib/img.ts resolves to. Full-size masters are still used by
 * the lightbox, the hero slider and the programme plates.
 * ------------------------------------------------------------------------ */

const THUMB_DIR = join(DIR, "thumbs");
const THUMB_EDGE = 800;

await mkdir(THUMB_DIR, { recursive: true });

let thumbBytes = 0;
for (const file of files) {
  const source = await readFile(join(DIR, file));
  const out = await sharp(source)
    .rotate()
    .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 70, mozjpeg: true, progressive: true })
    .toBuffer();
  await writeFile(join(THUMB_DIR, file.replace(/\.png$/i, ".jpg")), out);
  thumbBytes += out.length;
}

console.log(`${files.length} thumbnails written to ${THUMB_DIR} (${mb(thumbBytes)} MB total)`);
