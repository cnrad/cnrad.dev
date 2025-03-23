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
        "absolute top-0 left-0 z-100 h-screen w-full overflow-y-auto bg-white sm:px-14",
        className,
      )}
      {...props}
    >
      <Link
        href="/blog"
        shallow={true}
        className="hover:text-primary text-tertiary relative top-10 cursor-pointer text-sm transition-colors duration-100 max-md:ml-8 md:sticky md:top-14 md:left-0"
      >
        Back
      </Link>

      {children}

      {/* Scroller  */}
      <motion.div
        ref={constraintsRef}
        className="fixed top-14 right-14 hidden h-[50vh] w-32 rounded-lg border border-gray-200 bg-gradient-to-b from-gray-100 to-gray-200 p-0.5"
      >
        <motion.div
          drag="y"
          dragControls={controls}
          dragConstraints={constraintsRef}
          dragElastic={0}
          dragTransition={{ bounceStiffness: 50, bounceDamping: 100 }}
          className="!cursor-drag h-18 w-full rounded-md border border-gray-300 bg-white"
        />
      </motion.div>
    </motion.div>
  );
};
