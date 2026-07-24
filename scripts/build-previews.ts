import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Full-res lossless originals live OUTSIDE public/ so they never get copied into
// dist/ and uploaded to Cloudflare Pages (several exceed the 25 MiB/file limit).
// The browser only ever fetches the derived preview/ and large/ tiers below.
const SRC = "art-src";

// Derived tiers generated from the full-res lossless (VP8L) carousel originals.
// - preview: tiny lossy, shown in the carousel cards and behind the lightbox
//            while it opens — displayed small, so gradient banding is invisible.
// - large:   shown full-screen in the lightbox once the open animation finishes.
//            Uses near-lossless webp (4:4:4 chroma) because the art is gradient-
//            heavy and ordinary lossy q80 visibly bands when shown that large.
const TIERS = [
  { name: "preview", dest: "public/art/preview", maxWidth: 1400, quality: 85 },
  {
    name: "large",
    dest: "public/art/large",
    maxWidth: 2048,
    quality: 60,
    nearLossless: true,
  },
];

const files = (await readdir(SRC)).filter((f) => f.endsWith(".webp")).sort();

for (const tier of TIERS) {
  await mkdir(tier.dest, { recursive: true });

  let totalSrc = 0;
  let totalDest = 0;

  console.log(`\n${tier.name} (≤${tier.maxWidth}px, q${tier.quality})`);

  for (const file of files) {
    const srcPath = join(SRC, file);
    const destPath = join(tier.dest, file);

    await sharp(srcPath)
      .resize({ width: tier.maxWidth, withoutEnlargement: true })
      .webp({
        quality: tier.quality,
        nearLossless: tier.nearLossless ?? false,
        effort: 6,
      })
      .toFile(destPath);

    const [srcStat, destStat] = await Promise.all([
      stat(srcPath),
      stat(destPath),
    ]);
    totalSrc += srcStat.size;
    totalDest += destStat.size;

    const srcMb = (srcStat.size / 1024 / 1024).toFixed(2);
    const destKb = (destStat.size / 1024).toFixed(0);
    const ratio = ((1 - destStat.size / srcStat.size) * 100).toFixed(1);
    console.log(
      `  ${file.padEnd(42)}  ${srcMb.padStart(7)} MB → ${destKb.padStart(5)} KB  (-${ratio}%)`,
    );
  }

  const totalSrcMb = (totalSrc / 1024 / 1024).toFixed(1);
  const totalDestMb = (totalDest / 1024 / 1024).toFixed(1);
  const totalRatio = ((1 - totalDest / totalSrc) * 100).toFixed(1);
  console.log(
    `  ${files.length} files: ${totalSrcMb} MB → ${totalDestMb} MB  (-${totalRatio}%)`,
  );
}
