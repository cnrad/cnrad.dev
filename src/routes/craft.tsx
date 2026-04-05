import { useState, useEffect } from "react";
import { motion } from "motion/react";

const ITEMS = [
  {
    title: "Slide to Agree",
    date: "October 16, 2025",
    href: "https://x.com/notcnrad/status/1978680621980438889",
    src: "/design/slide-to-agree.mp4",
  },
  {
    title: "Digital Signatures",
    date: "August 16, 2025",
    href: "https://x.com/notcnrad/status/1956805856374251759",
    src: "/design/digital-signatures.mp4",
  },
  {
    title: "Dismissable Toasts",
    date: "July 8, 2025",
    href: "https://x.com/notcnrad/status/1942453977313878270",
    src: "/design/dismissable-toasts.mp4",
  },
  {
    title: "Documenting Life",
    date: "July 5, 2025",
    href: "https://x.com/notcnrad/status/1941561256164598196",
    src: "/design/documenting-life.mp4",
  },
  {
    title: "Marking Menus",
    date: "June 1, 2025",
    href: "https://x.com/notcnrad/status/1929283404563984785",
    src: "/design/marking-menus.mp4",
  },
];

function CraftCard({
  item,
  isHovered,
  onHover,
}: {
  item: (typeof ITEMS)[number];
  isHovered: boolean;
  onHover: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <a
      href={item.href}
      rel="noopener noreferrer"
      target="_blank"
      className="flex flex-col gap-2 py-3 opacity-100 transition-opacity duration-300 ease-out md:group-hover:opacity-40 md:hover:!opacity-100 md:flex-row md:items-start md:gap-4"
      onMouseEnter={onHover}
    >
      <div className="shrink-0 pt-1 md:mr-5">
        <p className="whitespace-nowrap text-sm font-medium text-neutral-200">
          {item.title}
        </p>
        <p className="whitespace-nowrap text-xs text-neutral-500">
          {item.date}
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-lg md:min-w-0 md:flex-1">
        <motion.video
          src={item.src}
          muted
          autoPlay
          loop
          playsInline
          className="w-full rounded-lg object-contain outline -outline-offset-1 outline-neutral-500/20 md:w-auto"
          initial={false}
          animate={{ width: isMobile ? "100%" : isHovered ? "100%" : "50%" }}
          transition={{ duration: 0.35, ease: [0.26, 1, 0.6, 1] }}
          style={{ marginLeft: "auto", display: "block" }}
        />
      </div>
    </a>
  );
}

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
