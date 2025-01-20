import { ComponentProps } from "react";

export const PageWrapper = ({ children, ...props }: ComponentProps<"div">) => {
  return (
    <div className="flex flex-col max-w-lg h-full p-14" {...props}>
      {children}
    </div>
  );
};
