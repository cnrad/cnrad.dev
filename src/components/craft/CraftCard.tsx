import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { EASE } from "../../lib/constants";

export type CraftItem = {
  title: string;
  date: string;
  href: string;
  src: string;
  aspect: number;
};

export function CraftCard({
  item,
  isHovered,
  onHover,
}: {
  item: CraftItem;
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
      className="flex flex-col gap-2 py-3 opacity-100 transition-opacity duration-300 ease-out md:group-hover:opacity-40 md:hover:opacity-100! md:flex-row md:items-start md:gap-4"
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
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            marginLeft: "auto",
            display: "block",
            aspectRatio: item.aspect,
          }}
        />
      </div>
    </a>
  );
}
