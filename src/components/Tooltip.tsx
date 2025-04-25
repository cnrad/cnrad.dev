import { cn } from "@/util/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState, forwardRef } from "react";

export const Tooltip = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    content: string | React.ReactNode;
    className?: string;
  }
>(({ children, content, className }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <AnimatePresence>
        {show ? (
          <motion.div
            initial={{ scale: 0.99, y: 2, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{
              scale: 0.99,
              y: 2,
              opacity: 0,
            }}
            onMouseOver={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            transition={{
              duration: 0.15,
              ease: [0.26, 1, 0.6, 1],
            }}
            className={cn(
              "group border-primary/10 fixed left-10 z-10 w-min overflow-clip rounded-[8px] border bg-white p-0.5 shadow-sm transition-colors duration-100 max-sm:hidden",
              className,
            )}
            style={{
              marginTop: `-2rem`,
              marginLeft: `-0.5rem`,
            }}
          >
            {typeof content === "string" ? (
              <p className="text-primary w-full rounded-full px-1.5 pt-1 text-center text-xs transition-colors duration-100">
                {content}
              </p>
            ) : (
              content
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        ref={ref}
        onMouseOver={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
    </div>
  );
});
Tooltip.displayName = "Tooltip";
