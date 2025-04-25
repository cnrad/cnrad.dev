import { PAGE_TRANSITION } from "@/util/const";
import { cn } from "@/util/utils";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Tooltip } from "./Tooltip";
dayjs.extend(utc);
dayjs.extend(timezone);

export const PageContent = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function PageContent({ children, ...props }, ref) {
    const [date, setDate] = useState(() => dayjs().tz("America/New_York"));

    useEffect(() => {
      const update = () => {
        setDate(dayjs().tz("America/New_York"));
      };

      const id = setInterval(update, 60 * 1000);

      return () => clearInterval(id);
    }, []);

    return (
      <motion.div
        className={cn(
          "max-xs:p-8 sticky top-0 flex w-full flex-col p-10 max-sm:relative max-sm:min-h-min max-sm:overflow-y-auto max-sm:!pt-10 max-sm:pb-8 sm:h-full min-sm:max-w-lg sm:pt-16 min-md:min-w-md",
          props.className,
        )}
      >
        <motion.h1
          layoutId="header"
          layout="position"
          className="text-primary xs:mt-4 mt-0 mb-1 text-2xl font-medium"
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

        <motion.footer
          layoutId="footer"
          layout="position"
          className="mt-auto flex w-full flex-row justify-between max-sm:hidden"
        >
          <Tooltip
            content={`This is my time. I'm probably ${date.hour() > 1 && date.hour() < 10 ? "sleeping" : "awake"}.`}
            className="whitespace-nowrap"
          >
            <p className="text-primary flex cursor-default flex-row items-center gap-1.5 text-sm">
              <span className="font-medium">{date.format("h:mm A")}</span>
              <span className="bg-primary block size-[3px] rounded-full" />
              <span className="text-tertiary">
                {date.format("MMM D, YYYY")}
              </span>
            </p>
          </Tooltip>
        </motion.footer>
      </motion.div>
    );
  },
);
