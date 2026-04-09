import { useState } from "react";
import { CraftCard } from "../components/craft/CraftCard";

const ITEMS = [
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
    aspect: 3024 / 1964,
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
        />
      ))}
    </div>
  );
}
