"use client";

import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const PageContent = forwardRef<HTMLElement, HTMLMotionProps<"main">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <motion.main
        ref={ref}
        initial={PAGE_TRANSITION.initial}
        animate={PAGE_TRANSITION.animate}
        exit={PAGE_TRANSITION.exit}
        transition={PAGE_TRANSITION.transition}
        className="flex flex-col max-w-lg h-full"
        {...props}
      >
        {children}
      </motion.main>
    );
  }
);
