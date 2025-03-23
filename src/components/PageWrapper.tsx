import { cn } from "@/util/utils";
import { ComponentProps } from "react";
import { MotionProps, motion } from "motion/react";

export const PageWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div"> & MotionProps) => {
  return (
    <motion.div
      className={cn(
        "absolute top-0 left-0 flex h-full w-full flex-col items-start overflow-y-auto max-md:min-h-full sm:flex-row",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
