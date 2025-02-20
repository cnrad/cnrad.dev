import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <PageWrapper>
      <PageContent>
        <p className="text-sm">this isn&apos;t even an actual page</p>
      </PageContent>

      <motion.div
        className="h-full w-min fixed right-18 bottom-12 flex flex-col items-end justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: 20,
          transition: {
            duration: 0.25,
          },
        }}
        transition={{
          duration: 1,
          ease: [0.26, 1, 0.6, 1],
        }}
      >
        <h1
          className="leading-[24rem] text-[24rem] font-black text-tertiary/15"
          style={{
            filter: "drop-shadow(0 4px 2px var(--color-background))",
          }}
        >
          404
        </h1>

        <p
          className="-mt-10 leading-[4rem] text-[4rem] font-semibold text-tertiary/15 text-right"
          style={{
            filter: "drop-shadow(0 3px 1px var(--color-background))",
          }}
        >
          not found. get real.
        </p>
      </motion.div>
    </PageWrapper>
  );
}
