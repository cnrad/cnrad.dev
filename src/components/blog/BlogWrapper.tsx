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
          y: -20,
          opacity: 0,
          scale: 1.05,
          transition: {
            duration: 0.35,
            ease: [0.26, 1, 0.6, 1],
          },
        }}
        transition={{
          duration: 1.25,
          ease: [0.26, 1, 0.6, 1],
        }}
        className="py-14 max-w-2xl text-primary text-sm ml-12 leading-relaxed flex flex-col gap-4 px-4"
        style={{ scrollbarWidth: "none" }}
        {...props}
      >
        {children}
      </motion.article>
    );
  }
);
