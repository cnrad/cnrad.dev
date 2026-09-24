import { Link } from "react-router";
import { motion } from "motion/react";
import { FluidAscii } from "../components/FluidAscii";
import { EASE } from "../lib/constants";
import { ChevronLeft } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/**
 * The 404 page — strictly "this URL doesn't exist." Runtime/render errors are a
 * different thing and surface as a modal over the site instead (ErrorModal, via
 * PageErrorBoundary and RouteErrorFallback), so this page never has to pretend
 * to be both.
 */
export function NotFound() {
  return (
    <div className="relative min-h-screen text-white px-6 md:px-10 overflow-hidden">
      <motion.div
        className="relative mx-auto flex max-w-2xl flex-col items-start py-16 z-10"
        style={{
          paddingTop: "calc(4rem + env(safe-area-inset-top))",
          paddingBottom: "calc(5rem + env(safe-area-inset-bottom) + 1.5rem)",
        }}
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-27"
        >
          <Link
            to="/"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-300 transition-colors -ml-1"
          >
            <ChevronLeft size={14} className="inline-block mr-0.5" />
            get me out of here
          </Link>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-2 text-2xl font-semibold"
        >
          page not found
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-3 max-w-md text-sm text-neutral-400 leading-5.5"
        >
          the page you're looking for doesn't exist. maybe it never did.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full h-screen z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 90%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 90%, black 100%)",
        }}
      >
        <FluidAscii className="h-full w-full" />
      </motion.div>
    </div>
  );
}
