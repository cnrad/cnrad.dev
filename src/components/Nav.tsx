import { cn } from "@/util/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";

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
      className="@max-sm:top-8 @max-sm:fixed font-karla py-3 w-min text-sm flex flex-row gap-6 text-secondary/70"
    >
      {Object.entries(PAGES).map(([name, href]) => (
        <Link
          href={href}
          key={name}
          className={cn("transition-colors duration-100 hover:text-secondary", {
            "text-primary/80 font-medium hover:text-primary/80":
              href === "/" ? pathname === href : pathname.includes(href),
          })}
        >
          {name}
        </Link>
      ))}

      <ThemeChanger />
    </motion.div>
  );
};
