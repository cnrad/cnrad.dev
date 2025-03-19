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
        className="max-sm:pt-6 max-w-2xl text-primary text-sm leading-6.5 flex flex-col gap-4 px-8 pb-14 mx-auto h-min"
        {...props}
      >
        {children}
      </motion.article>
    );
  }
);
