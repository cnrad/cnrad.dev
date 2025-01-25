import { cn } from "@/util/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = {
  home: "/",
  art: "/art",
  blog: "/blog",
  more: "/more",
} as const;

export const Nav = () => {
  const pathname = usePathname();

  return (
    <motion.div
      layoutId="nav"
      className="font-karla py-3 w-min text-sm flex flex-row gap-6 text-[#A0A0A0]"
    >
      {Object.entries(PAGES).map(([name, href]) => (
        <Link
          href={href}
          key={name}
          className={cn("transition-colors duration-100 hover:text-[#767676]", {
            "text-[#5D5D5D] font-medium hover:text-[#5D5D5D]":
              href === "/" ? pathname === href : pathname.includes(href),
          })}
        >
          {name}
        </Link>
      ))}
    </motion.div>
  );
};
