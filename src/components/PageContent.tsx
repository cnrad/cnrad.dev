import { PAGE_TRANSITION } from "@/util/const";
import { cn } from "@/util/utils";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <motion.div
        className={cn(
          "max-xs:p-8 sticky top-0 flex w-full flex-col p-14 max-sm:relative max-sm:min-h-min max-sm:overflow-y-auto max-sm:!pt-10 max-sm:pb-8 sm:h-full min-sm:max-w-lg sm:pt-20 min-md:min-w-md",
          props.className,
        )}
      >
        <motion.h1
          layoutId="header"
          layout="position"
          className="text-primary xs:mt-4 mt-0 mb-1 text-2xl font-medium"
        >
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

        <motion.footer
          layoutId="footer"
          layout="position"
          className="mt-auto flex w-full flex-row justify-between max-sm:hidden"
        >
          <p className="font-medium text-stone-200 italic">
            Conrad Crawford, {new Date().getFullYear()}
          </p>
        </motion.footer>
      </motion.div>
    );
  },
);
