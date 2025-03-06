import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <motion.div className="max-sm:mb-12 max-sm:min-h-min sm:pt-20 flex flex-col w-full @max-lg:overflow-y-auto @max-lg:pb-20 @min-xl:max-w-lg h-full @max-md:p-8 max-sm:!pt-14 p-14 top-0 @max-xl:relative sticky">
        <motion.h1 className="mt-0 text-2xl sm:mt-4 mb-1 font-medium text-primary">
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

        <motion.div
          layoutId="footer"
          className="@max-xl:hidden w-full flex flex-row mt-auto justify-between"
        >
          <p className="font-medium italic text-stone-200">
            Conrad Crawford, {new Date().getFullYear()}
          </p>

          {/* <ThemeChanger /> */}
        </motion.div>
      </motion.div>
    );
  }
);
