import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { EASE } from "../../lib/constants";
import { craftVideoElements } from "../../lib/preload";

// Match the site's route-fade behavior: skip the intro when the user prefers
// reduced motion. Static for the session.
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type CraftItem = {
  title: string;
  date: string;
  href?: string;
  src: string;
  aspect: number;
};

export function CraftCard({
  item,
  index,
  delay,
  isHovered,
  anyHovered,
  onHover,
  onUnhover,
}: {
  item: CraftItem;
  /** Position in the list — used by the scroll-driven hover hit-test. */
  index: number;
  /** ms to wait before this card fades in and its video starts playing. */
  delay: number;
  isHovered: boolean;
  /** True when any card in the list is hovered (drives sibling dimming). */
  anyHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoAttached = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Attach the video into the DOM immediately (so its first frame paints and the
  // card is never blank), but hold off starting playback — that's the expensive
  // part, staggered in the effect below.
  const attachVideo = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container || videoAttached.current) return;
      const preloaded = craftVideoElements.get(item.src);
      const video = preloaded ?? document.createElement("video");
      if (!preloaded) {
        video.src = item.src;
        video.preload = "auto";
      }
      video.muted = true;
      video.autoplay = false;
      video.loop = true;
      video.playsInline = true;
      // No outline here: Safari paints the video's compositing layer over an
      // outline/border set on the <video> itself, so the ring is drawn by the
      // absolutely-positioned overlay sibling below (which stacks above it).
      video.className = "w-full rounded-lg object-contain md:w-auto";
      video.style.marginLeft = "auto";
      video.style.display = "block";
      video.style.aspectRatio = String(item.aspect);
      container.appendChild(video);
      videoRef.current = video;
      videoAttached.current = true;
      containerRef.current = container;
    },
    [item.src, item.aspect],
  );

  // Start playback on the same stagger as the card's fade-in, so the clip begins
  // moving exactly as it appears — and the decode cost spreads across frames.
  useEffect(() => {
    const t = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Animate width on the container instead of the video
  const width = isMobile ? "100%" : isHovered ? "100%" : "50%";

  return (
    <a
      href={item.href}
      rel="noopener noreferrer"
      target="_blank"
      data-craft-index={index}
      className="flex flex-col gap-2 py-3 transition-opacity duration-300 ease-out md:flex-row md:items-start md:gap-4"
      style={{
        // Dimming is state-driven (not CSS :hover) so it tracks the cursor even
        // while scrolling, when the browser won't refresh :hover on its own.
        opacity: !isMobile && anyHovered && !isHovered ? 0.4 : 1,
        ...(prefersReducedMotion
          ? undefined
          : {
              animation: "routeFadeUp 0.4s ease-out backwards",
              animationDelay: `${delay}ms`,
            }),
      }}
      onMouseEnter={onHover}
      onFocus={onHover}
      onBlur={onUnhover}
    >
      <div className="shrink-0 pt-1 md:mr-5 max-md:mb-2">
        <p className="whitespace-nowrap text-sm font-medium text-neutral-200">
          {item.title}
        </p>
        <p className="whitespace-nowrap text-xs text-neutral-500">
          {item.date}
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-lg md:min-w-0 md:flex-1">
        <motion.div
          ref={attachVideo}
          className="relative rounded-lg max-md:w-full!"
          initial={false}
          animate={{ width }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            marginLeft: "auto",
            display: "block",
            aspectRatio: item.aspect,
          }}
        >
          {/* Safari (iOS + macOS) paints the video's compositing layer over an
              outline set on the <video> itself, so draw the ring on this
              absolutely-positioned overlay, which stacks above the static video
              in every browser. The overlay tracks the video exactly because the
              video fills this box (Tailwind preflight caps it at max-width:100%). */}
          <div className="pointer-events-none absolute inset-0 rounded-lg outline -outline-offset-1 outline-neutral-500/20" />
        </motion.div>
      </div>
    </a>
  );
}
