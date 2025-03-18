import { HTMLMotionProps, motion } from "motion/react";
import Link from "next/link";
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
        className="absolute top-0 left-0 w-full min-h-screen h-min bg-white sm:px-14"
        {...props}
      >
        <Link
          href="/blog"
          className="max-sm:hidden sticky top-14 text-sm hover:text-primary text-tertiary cursor-pointer duration-100 transition-colors"
        >
          Back
        </Link>

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
          className="max-sm:pt-6 max-w-2xl text-primary text-sm leading-6.5 flex flex-col gap-4 px-8 pb-14 mx-auto"
        >
          {children}
        </motion.article>
      </motion.div>
    );
  }
);
