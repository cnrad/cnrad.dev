import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";
import { Nav } from "./Nav";

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <motion.div className="flex flex-col w-full @min-xl:max-w-lg h-full @max-sm:p-8 @max-xl:px-12 @max-sm:pt-16 p-14 top-0 @max-xl:relative sticky">
        <Nav />

        <motion.h1 className="text-2xl mt-6 mb-1 font-medium text-primary">
          Conrad Crawford
        </motion.h1>

        <motion.div
          ref={ref}
          initial={PAGE_TRANSITION.initial}
          animate={PAGE_TRANSITION.animate}
          exit={PAGE_TRANSITION.exit}
          transition={PAGE_TRANSITION.transition}
          {...props}
        >
          {children}
        </motion.div>

        <motion.div className="w-full flex flex-row mt-auto justify-between">
          <p className="font-medium italic text-tertiary @max-xl:hidden brightness-175">
            Conrad Crawford, {new Date().getFullYear()}
          </p>

          {/* <ThemeChanger /> */}
        </motion.div>
      </motion.div>
    );
  }
);
