import { useState, useEffect, useRef } from "react";
import { CraftCard } from "../components/craft/CraftCard";

// ms between each card's fade-in and its video's playback start. Spreading the
// video decodes across frames (instead of firing them all at once on mount)
// keeps the heavy mount from stuttering the header's text-morph animation.
const STAGGER_MS = 100;

const ITEMS = [
  {
    title: "HDR Sunset",
    date: "July 2, 2026",
    href: "https://x.com/notcnrad/status/2072581377141211312?s=20",
    src: "/design/hdr-sunset.mp4",
    aspect: 1920 / 1080,
  },
  {
    title: "Bionic Scrolling",
    date: "June 10, 2026",
    href: "https://x.com/notcnrad/status/2064720742139228200",
    src: "/design/bionic-scrolling.mp4",
    aspect: 2984 / 1586,
  },
  {
    title: "Slide to Agree",
    date: "October 16, 2025",
    href: "https://x.com/notcnrad/status/1978680621980438889",
    src: "/design/slide-to-agree.mp4",
    aspect: 2408 / 1354,
  },
  {
    title: "Digital Signatures",
    date: "August 16, 2025",
    href: "https://x.com/notcnrad/status/1956805856374251759",
    src: "/design/digital-signatures.mp4",
    aspect: 3014 / 1548,
  },
  {
    title: "Dismissable Toasts",
    date: "July 8, 2025",
    href: "https://x.com/notcnrad/status/1942453977313878270",
    src: "/design/dismissable-toasts.mp4",
    aspect: 2882 / 1562,
  },
  {
    title: "Documenting Life",
    date: "July 5, 2025",
    href: "https://x.com/notcnrad/status/1941561256164598196",
    src: "/design/documenting-life.mp4",
    aspect: 3006 / 1588,
  },
  {
    title: "Marking Menus",
    date: "June 1, 2025",
    href: "https://x.com/notcnrad/status/1929283404563984785",
    src: "/design/marking-menus.mp4",
    aspect: 1528 / 856,
  },
];

export function Craft() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--craft-scroll-pad",
      hoveredIndex === null ? "150px" : "0px",
    );
    return () => {
      root.style.removeProperty("--craft-scroll-pad");
    };
  }, [hoveredIndex]);

  // Keep the hovered card in sync with whatever sits under the cursor while the
  // page scrolls. Browsers don't refresh :hover when content moves under a
  // stationary pointer, so we re-run the hit-test ourselves. It's a single
  // elementFromPoint per animation frame — cheap, and no virtual scroll needed
  // (that's what made the old Lenis version heavy on Safari).
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef(0);
  useEffect(() => {
    // Hover-follow only makes sense with a fine pointer; skip on touch.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onPointerMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };

    const resolveHover = () => {
      rafId.current = 0;
      const p = pointer.current;
      if (!p) return;
      const el = document.elementFromPoint(p.x, p.y) as HTMLElement | null;
      const card = el?.closest<HTMLElement>("[data-craft-index]");
      const next = card ? Number(card.dataset.craftIndex) : null;
      setHoveredIndex((cur) => (cur === next ? cur : next));
    };

    const onScroll = () => {
      if (rafId.current) return; // coalesce to one hit-test per frame
      rafId.current = requestAnimationFrame(resolveHover);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className="group flex w-full flex-col"
      // Opt out of the layout's block-level route fade; each card fades itself
      // in on a stagger instead (see CraftCard), so the two don't compound.
      style={{ animation: "none" }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {ITEMS.map((item, i) => (
        <CraftCard
          key={item.title}
          item={item}
          index={i}
          delay={i * STAGGER_MS}
          isHovered={hoveredIndex === i}
          anyHovered={hoveredIndex !== null}
          onHover={() => setHoveredIndex(i)}
          onUnhover={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
        />
      ))}
    </div>
  );
}
