import { PAGE_TRANSITION } from "@/util/const";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";
import { Nav } from "./Nav";
import dynamic from "next/dynamic";

const ThemeChanger = dynamic(() => import("./ThemeChanger"), { ssr: false });

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    return (
      <motion.div
        layout
        className="flex flex-col w-full max-w-lg h-full @max-sm:p-8 @max-sm:pt-16 p-14 top-0 @max-xl:relative sticky"
      >
        {/* Corner */}
        <div className="absolute top-4 left-4 w-3 h-3 border-b border-r border-tertiary/20 border-dashed ml-[1px] mt-[1px]" />
        <div
          className="absolute top-7 left-7 w-10 h-10 border-t border-l border-tertiary/20"
          style={{
            maskImage:
              "linear-gradient(to bottom right, rgba(0,0,0,1), rgba(0,0,0,0) 50%)",
          }}
        />

        <Nav />

        <motion.h1
          layoutId="name"
          className="text-2xl mt-6 mb-1 font-medium text-primary"
        >
          Conrad Crawford
        </motion.h1>

        <motion.div
          ref={ref}
          initial={PAGE_TRANSITION.initial}
          animate={PAGE_TRANSITION.animate}
          exit={PAGE_TRANSITION.exit}
          transition={PAGE_TRANSITION.transition}
          {...props}
        >
          {children}
        </motion.div>

        <motion.div
          layoutId="footer"
          className="w-full flex flex-row mt-auto justify-between"
        >
          <p className="font-medium italic text-tertiary/25 @max-xl:hidden">
            Conrad Crawford, {new Date().getFullYear()}
          </p>
          <ThemeChanger />
        </motion.div>
      </motion.div>
    );
  }
);
