import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";
import { Nav } from "./Nav";

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <div className="flex flex-col max-w-lg h-full @max-sm:p-8 @max-sm:pt-16 p-14 top-0 @max-xl:relative sticky">
        <Nav />

        <h1 className="text-2xl mt-6 mb-1 font-medium text-primary">
          Conrad Crawford
        </h1>

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

        <p className="font-medium italic text-primary/10 mt-auto @max-xl:hidden">
          Conrad Crawford, {new Date().getFullYear()}
        </p>
      </div>
    );
  }
);
