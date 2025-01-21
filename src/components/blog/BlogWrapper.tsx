"use client";

import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const BlogContent = forwardRef<HTMLElement, HTMLMotionProps<"article">>(
  function BlogContent({ children, ...props }, ref) {
    return (
      <motion.article
        ref={ref}
        initial={{
          y: 10,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: 10,
          opacity: 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="h-full max-w-xl text-black text-sm ml-24 leading-relaxed overflow-y-auto flex flex-col gap-4 py-24"
        style={{ scrollbarWidth: "none" }}
        {...props}
      >
        {children}
      </motion.article>
    );
  }
);
