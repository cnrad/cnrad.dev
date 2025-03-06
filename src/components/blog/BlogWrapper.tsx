import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

export const BlogContent = forwardRef<HTMLElement, HTMLMotionProps<"article">>(
  function BlogContent({ children, ...props }, ref) {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.35,
            ease: [0.26, 1, 0.6, 1],
          },
        }}
        transition={{
          duration: 0.75,
          ease: [0.26, 1, 0.6, 1],
        }}
        className="w-full min-h-screen h-min bg-linear-to-r from-transparent to-white to-15%"
        {...props}
      >
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
            scale: 0.96,
            transition: {
              duration: 0.35,
              ease: [0.26, 1, 0.6, 1],
            },
          }}
          transition={{
            duration: 0.35,
            ease: [0.26, 1, 0.6, 1],
          }}
          style={{ scrollbarWidth: "none" }}
          className="max-w-2xl text-primary text-sm leading-6.5 flex flex-col gap-4 py-14 px-8 mx-auto"
        >
          {children}
        </motion.article>
      </motion.div>
    );
  }
);
