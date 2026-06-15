import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "public/art/carousel";
const DEST = "public/art/preview";
const MAX_WIDTH = 1400;
const QUALITY = 85;

await mkdir(DEST, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".webp")).sort();

let totalSrc = 0;
let totalDest = 0;

for (const file of files) {
  const srcPath = join(SRC, file);
  const destPath = join(DEST, file);

  await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(destPath);

  const [srcStat, destStat] = await Promise.all([stat(srcPath), stat(destPath)]);
  totalSrc += srcStat.size;
  totalDest += destStat.size;

  const srcMb = (srcStat.size / 1024 / 1024).toFixed(2);
  const destKb = (destStat.size / 1024).toFixed(0);
  const ratio = ((1 - destStat.size / srcStat.size) * 100).toFixed(1);
  console.log(`${file.padEnd(42)}  ${srcMb.padStart(7)} MB → ${destKb.padStart(5)} KB  (-${ratio}%)`);
}

const totalSrcMb = (totalSrc / 1024 / 1024).toFixed(1);
const totalDestMb = (totalDest / 1024 / 1024).toFixed(1);
const totalRatio = ((1 - totalDest / totalSrc) * 100).toFixed(1);
console.log(`\n${files.length} files: ${totalSrcMb} MB → ${totalDestMb} MB  (-${totalRatio}%)`);
