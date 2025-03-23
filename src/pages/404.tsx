import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <PageWrapper>
      <PageContent>
        <p className="text-sm">not sure how you got here...</p>
      </PageContent>

      <motion.div
        className="fixed right-18 bottom-0 flex h-full w-min flex-col items-end justify-end"
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
          className="text-tertiary/15 text-[24rem] leading-[24rem] font-black"
          style={{
            filter: "drop-shadow(0 4px 2px var(--color-background))",
          }}
        >
          404
        </h1>
      </motion.div>
    </PageWrapper>
  );
}
