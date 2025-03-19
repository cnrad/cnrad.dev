import { MotionProps, motion, useDragControls } from "motion/react";
import Link from "next/link";
import { ComponentProps, useRef } from "react";
import { cn } from "@/util/utils";

export const BlogWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div"> & MotionProps) => {
  const controls = useDragControls();
  const constraintsRef = useRef(null);

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
      }}
      transition={{
        duration: 0.5,
        ease: [0.26, 1, 0.6, 1],
      }}
      className={cn(
        "absolute top-0 left-0 w-full h-screen bg-white sm:px-14 z-100 overflow-y-auto",
        className
      )}
      {...props}
    >
      <Link
        href="/blog"
        shallow={true}
        className="max-sm:hidden left-14 sticky top-14 text-sm hover:text-primary text-tertiary cursor-pointer duration-100 transition-colors"
      >
        Back
      </Link>

      {children}

      {/* Scroller  */}
      <motion.div
        ref={constraintsRef}
        className="hidden fixed w-32 h-[50vh] right-14 top-14 bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-200 rounded-lg p-0.5"
      >
        <motion.div
          drag="y"
          dragControls={controls}
          dragConstraints={constraintsRef}
          dragElastic={0}
          dragTransition={{ bounceStiffness: 50, bounceDamping: 100 }}
          className="w-full h-18 bg-white rounded-md border border-gray-300 !cursor-drag"
        />
      </motion.div>
    </motion.div>
  );
};
