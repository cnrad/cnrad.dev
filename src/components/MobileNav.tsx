import { cn } from "@/util/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = {
  home: "/",
  art: "/art",
  blog: "/blog",
  more: "/more",
} as const;

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <>
      <motion.div className="bottom-0 @max-md:px-8 pointer-events-none fixed sm:hidden font-karla px-14 py-4 w-full max-h-20 text-sm text-tertiary z-[100] bg-white shadow-white shadow-[0_0_10px_20px]">
        <div className="w-full flex flex-row gap-6">
          {Object.entries(PAGES).map(([name, href]) => (
            <Link
              href={href}
              key={name}
              className={cn(
                "pointer-events-auto relative transition-colors duration-100 hover:text-secondary @max-md:text-base py-2 @max-md:px-2",
                {
                  "text-primary font-medium hover:text-primary":
                    href === "/" ? pathname === href : pathname.includes(href),
                }
              )}
            >
              {name}

              <AnimatePresence>
                {(
                  href === "/" ? pathname === href : pathname.includes(href)
                ) ? (
                  <motion.span
                    initial={{
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 4,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: [0.26, 1, 0.6, 1],
                    }}
                    className="rounded-full bg-primary w-4 h-0.5 max-h-0.5 min-h-0.5 absolute -bottom-0 left-1/2 -translate-x-1/2"
                  />
                ) : null}
              </AnimatePresence>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="sm:hidden gradient-blur bottom-10 left-0 w-screen h-32 max-h-32">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </>
  );
};
