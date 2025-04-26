import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const BlogContent = forwardRef<HTMLElement, HTMLMotionProps<"article">>(
  function BlogContent({ children, ...props }, ref) {
    return (
      <motion.article
        ref={ref}
        initial={{
          y: 15,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: 0,
          opacity: 0,
          scale: 0.98,
        }}
        transition={{
          duration: 0.5,
          ease: [0.26, 1, 0.6, 1],
        }}
        style={{ scrollbarWidth: "none" }}
        className="text-primary mx-auto flex h-min max-w-2xl flex-col gap-4 px-8 pb-14 text-sm leading-6.5 max-md:pt-4"
        {...props}
      >
        {children}
      </motion.article>
    );
  },
);
