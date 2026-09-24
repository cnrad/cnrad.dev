import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { EASE } from "../lib/constants";

/**
 * A small modal that surfaces an unexpected runtime error *over* whatever is
 * on screen, rather than replacing the whole page. Used two ways:
 *  - by PageErrorBoundary, where the site chrome stays mounted behind it, so
 *    the reader keeps their bearings; and
 *  - by the router's errorElement (RouteErrorFallback) for loader / layout
 *    errors, where there's nothing left to preserve — it just sits on the bare
 *    background.
 * A genuine 404 is a different thing entirely and gets its own page (NotFound).
 */
export function ErrorModal({
  message,
  resetErrorBoundary,
}: {
  message?: string;
  resetErrorBoundary?: () => void;
}) {
  const navigate = useNavigate();

  const goHome = () => {
    resetErrorBoundary?.();
    navigate("/");
  };
  // A full reload is the one recovery that always works — even when the error
  // is on the home page itself, so "go home" would be a no-op.
  const reload = () => window.location.reload();

  // Lock scroll behind the modal, matching the writing overlay.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape gets the reader back to a known-good page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goHome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Dim and softly blur whatever is behind — the persistent site chrome
          for a page error, or the bare background for a route-level one. */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-label="Something went wrong"
        className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-[#0c0c0c]/95 p-6 shadow-2xl shadow-black/60"
        initial={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h2 className="text-base font-semibold text-white">
          something went wrong
        </h2>
        <p className="mt-2 text-sm leading-5.5 text-neutral-400">
          an unexpected error interrupted this page. reloading usually clears it.
        </p>

        {message ? (
          <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-neutral-500/10 bg-neutral-950/50 p-3 text-xs leading-5 text-neutral-500">
            {message}
          </pre>
        ) : null}

        <div className="mt-6 flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={reload}
            className="font-medium text-neutral-200 transition-colors hover:text-white"
          >
            reload page
          </button>
          <button
            type="button"
            onClick={goHome}
            className="text-neutral-500 transition-colors hover:text-neutral-300"
          >
            go home
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
