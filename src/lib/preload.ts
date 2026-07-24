// Craft video preloading — create real <video> elements so the browser
// buffers and decodes the media, not just the HTTP cache.
const CRAFT_VIDEOS = [
  "/design/slide-to-agree.mp4",
  "/design/digital-signatures.mp4",
  "/design/dismissable-toasts.mp4",
  "/design/documenting-life.mp4",
  "/design/marking-menus.mp4",
];

let craftPreloaded = false;
export const craftVideoElements = new Map<string, HTMLVideoElement>();

export function preloadCraftVideos() {
  if (craftPreloaded) return;
  craftPreloaded = true;
  for (const src of CRAFT_VIDEOS) {
    const video = document.createElement("video");
    video.src = src;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    craftVideoElements.set(src, video);
  }
}

// Art carousel image preloading
const imageCache = new Set<string>();

function preloadImage(src: string) {
  if (imageCache.has(src)) return;
  imageCache.add(src);
  const img = new Image();
  img.src = src;
}

export function preloadArtImages() {
  // Dynamically import art data to avoid pulling it into the main bundle
  Promise.all([import("../data/art"), import("../components/art/BlurImage")]).then(
    ([{ WORKS }, { previewUrl }]) => {
      const PRELOAD_AHEAD = 3;
      for (let off = -PRELOAD_AHEAD; off <= PRELOAD_AHEAD; off++) {
        const idx = ((off % WORKS.length) + WORKS.length) % WORKS.length;
        const piece = WORKS[idx]!;
        preloadImage(previewUrl(piece.href));
      }
    },
  );
}
