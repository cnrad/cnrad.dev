import { cn } from "@/util/utils";
import { ComponentProps } from "react";
import { Nav } from "./Nav";

export const PageWrapper = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex flex-col max-w-lg h-full p-14", className)}
      {...props}
    >
      <Nav />

      {children}
    </div>
  );
};
