import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { EASE } from "../../lib/constants";
import { craftVideoElements } from "../../lib/preload";

export type CraftItem = {
  title: string;
  date: string;
  href?: string;
  src: string;
  aspect: number;
};

export function CraftCard({
  item,
  isHovered,
  onHover,
  onUnhover,
}: {
  item: CraftItem;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoAttached = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Attach the preloaded video element directly into the DOM
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
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.className =
        "w-full rounded-lg object-contain outline -outline-offset-1 outline-neutral-500/20 md:w-auto";
      video.style.marginLeft = "auto";
      video.style.display = "block";
      video.style.aspectRatio = String(item.aspect);
      container.appendChild(video);
      video.play().catch(() => {});
      videoAttached.current = true;
      containerRef.current = container;
    },
    [item.src, item.aspect],
  );

  // Animate width on the container instead of the video
  const width = isMobile ? "100%" : isHovered ? "100%" : "50%";

  return (
    <a
      href={item.href}
      rel="noopener noreferrer"
      target="_blank"
      className="flex flex-col gap-2 py-3 opacity-100 transition-opacity duration-300 ease-out md:group-hover:opacity-40 md:group-focus-within:opacity-40 md:hover:opacity-100! md:focus:opacity-100! md:flex-row md:items-start md:gap-4"
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
          {/* iOS Safari paints the video's compositing layer over an outline set
              on the <video> itself, so draw the ring on an overlay above it. */}
          <div className="pointer-events-none absolute inset-0 rounded-lg outline -outline-offset-1 outline-neutral-500/20 md:hidden" />
        </motion.div>
      </div>
    </a>
  );
}
