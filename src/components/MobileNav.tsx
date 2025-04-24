import { cn } from "@/util/utils";
import { motion } from "motion/react";
import { useRouter } from "next/router";

const PAGES = {
  home: "/",
  art: "/art",
  blog: "/blog",
  more: "/more",
} as const;

export const MobileNav = () => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <>
      <motion.div
        layout
        className="font-karla text-tertiary border-tertiary/15 pointer-events-none fixed bottom-4 left-1/2 z-100 w-min -translate-x-1/2 rounded-full border bg-white p-1.5 text-sm shadow-xl shadow-black/5 sm:hidden"
      >
        <div className="flex w-full flex-row items-center justify-center gap-4">
          {Object.entries(PAGES).map(([name, href]) => {
            const isActive =
              href === "/" ? pathname === href : pathname.includes(href);

            return (
              <>
                <button
                  key={name}
                  onTouchStart={() => router.prefetch(href)}
                  onClick={() => {
                    document
                      .querySelector("main")
                      ?.scrollTo({ top: 0, behavior: "instant" });
                    router.push(href);
                  }}
                  className={cn(
                    "hover:text-secondary pointer-events-auto relative px-3 py-1.5 transition-all duration-100 [-webkit-touch-callout:none] select-none active:scale-90",
                    {
                      "text-primary hover:text-primary font-medium": isActive,
                    },
                  )}
                >
                  {name}

                  {isActive ? (
                    <motion.span
                      layoutId="highlight"
                      style={{
                        position: "absolute",
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.26, 1, 0.6, 1],
                      }}
                      className="bg-tertiary/5 border-secondary/5 top-1/2 left-1/2 h-full w-full -translate-1/2 rounded-full border"
                    />
                  ) : null}
                </button>
              </>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};
