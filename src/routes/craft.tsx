import { useState, useEffect } from "react";
import { CraftCard } from "../components/craft/CraftCard";

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

  return (
    <div
      className="group flex w-full flex-col"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {ITEMS.map((item, i) => (
        <CraftCard
          key={item.title}
          item={item}
          isHovered={hoveredIndex === i}
          onHover={() => setHoveredIndex(i)}
          onUnhover={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
        />
      ))}
    </div>
  );
}
