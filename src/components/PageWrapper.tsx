import { cn } from "@/util/utils";
import { ComponentProps } from "react";
import { AnimatePresence } from "motion/react";

export const PageWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "flex flex-row w-full h-full items-start overflow-y-scroll",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  );
};
