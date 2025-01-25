import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";
import { Nav } from "./Nav";

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <div className="flex flex-col max-w-lg h-full p-14 top-0 sticky">
        <Nav />

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

        <p className="font-medium italic text-black/15 mt-auto">
          Conrad Crawford, {new Date().getFullYear()}
        </p>
      </div>
    );
  }
);
