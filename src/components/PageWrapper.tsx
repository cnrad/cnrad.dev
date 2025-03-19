import { cn } from "@/util/utils";
import { ComponentProps } from "react";
import { MobileNav } from "./MobileNav";
import { MotionProps, motion } from "motion/react";

export const PageWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div"> & MotionProps) => {
  return (
    <>
      <motion.div
        className={cn(
          "absolute top-0 left-0 flex flex-col sm:flex-row w-full h-full items-start overflow-y-auto @max-md:min-h-full @max-md:pb-12",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>

      <MobileNav />
    </>
  );
};
