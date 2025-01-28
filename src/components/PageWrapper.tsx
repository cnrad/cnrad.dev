import { cn } from "@/util/utils";
import { ComponentProps } from "react";

export const PageWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 flex flex-row w-full h-full items-start overflow-y-auto @max-sm:min-h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
