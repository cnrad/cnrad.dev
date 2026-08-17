import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "../lib/constants";
import { getWritingPost } from "../lib/writing";
import { Markdown } from "./Markdown";

// The reading view fades text into the top and bottom edges of the window.
// Rather than masking the scrolling layer (which forces a per-frame repaint and
// costs scroll smoothness), two fixed scrims in the backdrop color sit above the
// text — top and bottom, each FADE px tall, fading to transparent. The text
// scrolls underneath them, so it visibly dissolves into the page edges while
// scrolling stays on the GPU fast path.
const FADE = 60;

/**
 * A full-viewport overlay "layer" for a single writing post. Rendered above the
 * whole site (portal to <body>) so the page behind it stays put; it scales and
 * fades in/out on its own. Driven by the URL: Layout passes the active slug
 * (or null once we've navigated away) and AnimatePresence handles the exit.
 */
export function WritingOverlay({
  slug,
  backTo,
}: {
  slug: string | null;
  backTo: string;
}) {
  const navigate = useNavigate();
  const post = slug ? getWritingPost(slug) : undefined;
  const open = Boolean(slug && post);

  // React Router stores its position in the session history stack on
  // history.state.idx. It's 0 for a direct/external load (nothing of ours to go
  // back to) and > 0 once the reader has navigated within the site — in which
  // case going back returns them to where they were (and keeps their scroll).
  const canGoBack = (window.history.state?.idx ?? 0) > 0;
  const dismiss = () => {
    if (canGoBack) navigate(-1);
    else navigate("/");
  };

  // Lock the page behind while the overlay is open so scroll doesn't chain.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape dismisses the layer, matching the top link (back, or home).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canGoBack, navigate]);

  return createPortal(
    <AnimatePresence>
      {open && post ? (
        <motion.div
          key="writing-overlay"
          // Solid, opaque backdrop — covers the site behind and is what the
          // faded text dissolves into at the window edges.
          className="fixed inset-0 z-50 bg-[#090909]"
          initial={{ opacity: 0, scale: 0.99, filter: "blur(2px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            scale: 0.99,
            filter: "blur(2px)",
            transition: {
              duration: 0.15,
            },
          }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {/* Scrolling text layer. */}
          <div className="absolute inset-0 cursor-default overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Grows to the full scrollable height, so the static noise
                (absolute inset-0 within it) spans the whole page. */}
            <div className="relative min-h-full">
              <div
                className="noise-bg pointer-events-none absolute inset-0 z-0 opacity-[0.01]"
                aria-hidden="true"
              />

              {/* Match the site layout: horizontal padding on the full-width
                  outer element, max-w-2xl on the centered inner column, so the
                  text column is the same width as the rest of the site. */}
              <div className="relative z-10 px-6 md:px-10">
                <article className="mx-auto w-full max-w-2xl pt-32 pb-20 selection:bg-neutral-500/30 selection:text-white">
                  <Link
                    to={canGoBack ? backTo : "/"}
                    onClick={(e) => {
                      // Left-click goes back through history (keeps the prior
                      // page's scroll); let modified clicks open `to` normally.
                      if (
                        canGoBack &&
                        e.button === 0 &&
                        !e.metaKey &&
                        !e.ctrlKey &&
                        !e.shiftKey &&
                        !e.altKey
                      ) {
                        e.preventDefault();
                        navigate(-1);
                      }
                    }}
                    className="text-sm text-neutral-600 transition hover:text-neutral-400"
                  >
                    {canGoBack ? "back" : "home"}
                  </Link>

                  <h1 className="mt-8 text-2xl font-semibold text-white">
                    {post.title}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500">{post.date}</p>

                  <div className="mt-8">
                    <Markdown content={post.content} />
                  </div>

                  <div className="h-px w-full bg-neutral-900 my-20"></div>
                </article>
              </div>
            </div>
          </div>

          {/* Fixed edge scrims — the text scrolls under these and fades into
              the backdrop color at the top and bottom of the window. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-[#090909] to-transparent"
            style={{ height: FADE }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#090909] to-transparent"
            style={{ height: FADE }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
