import { Outlet, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useOutlet } from "react-router";
import { prepare, layout } from "@chenglou/pretext";
import { SignatureReveal } from "../components/SignatureReveal";
import { TextMorph } from "../components/TextMorph";
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="1 0 22 22" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const transition = {
  duration: 0.8,
  ease: [0.26, 1, 0.6, 1] as const,
};

const pageDescriptions: Record<string, string> = {
  "/": "software used to feel like magic. somewhere along the way, that magic was lost in the monetization of the digital world and constant shipping at the expense of quality. i bring that magic back, in hopes of making software *feel* great again.",
  "/art":
    "i dabble with creating digital abstract art in hopes of expressing *something*.",
  "/craft":
    "the possibilities of human computer interaction are essentially limitless. i explore these possibilities through the beauty of the web (some call it design engineering). it's quite fun to imagine what the future of software could look like - it's more fun to build.",
  "/more":
    "here's some more about my background and what i do outside of tech. feel free to reach out about anything - whether you want to put me on to some new music, or just want to chat.",
};

const allDescriptions = Object.values(pageDescriptions);
const navItems = ["work", "craft", "art", "more"];

function useMaxParagraphHeight(font: string, lineHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const preparedTexts = useRef(allDescriptions.map((t) => prepare(t, font)));

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;

    let tallest = 0;
    for (const prepared of preparedTexts.current) {
      const { height } = layout(prepared, width, lineHeight);
      if (height > tallest) tallest = height;
    }
    setMaxHeight(tallest);
  }, [lineHeight]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, maxHeight };
}

function useNoiseDataUrl(size = 128) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 18;
    }
    ctx.putImageData(imageData, 0, 0);
    setUrl(canvas.toDataURL("image/png"));
  }, [size]);

  return url;
}

/**
 * Freezes the outlet only during exit animations (when the base path changes).
 * Allows updates within the same base path (e.g. /art → /art/slug).
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const location = useLocation();
  const basePath = "/" + (location.pathname.split("/")[1] ?? "");
  const frozenRef = useRef({ outlet, basePath });

  // If the base path is the same, allow the outlet to update (e.g. param changes)
  // If different, we're in an exit animation — keep the frozen version
  if (basePath === frozenRef.current.basePath) {
    frozenRef.current = { outlet, basePath };
  }

  return frozenRef.current.outlet;
}

function useIsScrollable() {
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    function check() {
      setScrollable(document.documentElement.scrollHeight > window.innerHeight);
    }
    check();
    window.addEventListener("resize", check);
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, []);

  return scrollable;
}

export function Layout() {
  const location = useLocation();
  const noiseUrl = useNoiseDataUrl();
  const basePath = "/" + (location.pathname.split("/")[1] ?? "");
  const isScrollable = useIsScrollable();

  // Smoothly scroll to the top whenever the base route changes, so that
  // navigating to a shorter page doesn't snap upward.
  const prevBasePath = useRef(basePath);
  useEffect(() => {
    if (prevBasePath.current === basePath) return;
    prevBasePath.current = basePath;
    if (window.scrollY === 0) return;

    const lenis = (window as any).__lenis as
      | { scrollTo: (target: number, opts?: { duration?: number }) => void }
      | undefined;
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, { duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [basePath]);
  const description = pageDescriptions[basePath] ?? pageDescriptions["/"]!;
  // 14px text (text-sm) with leading-5.5 (line-height: 22px)
  const { containerRef, maxHeight } = useMaxParagraphHeight(
    "14px Open Sans",
    22,
  );

  return (
    <div className="relative min-h-screen text-white px-6 md:px-10">
      {/* Noise overlay */}
      {noiseUrl && (
        <div
          className="pointer-events-none fixed inset-0 z-[1] opacity-20"
          style={{
            backgroundImage: `url(${noiseUrl})`,
            backgroundRepeat: "repeat",
          }}
        />
      )}

      {/* Bottom progressive blur */}
      <motion.div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {[
          { blur: "1px", maskStart: 0, maskEnd: 25 },
          { blur: "3px", maskStart: 25, maskEnd: 75 },
          { blur: "6px", maskStart: 75, maskEnd: 100 },
        ].map((layer, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${layer.blur})`,
              WebkitBackdropFilter: `blur(${layer.blur})`,
              maskImage: `linear-gradient(to bottom, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`,
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-start py-16 z-10 pb-20"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.25 }}
      >
        <motion.div variants={fadeUp} transition={transition} className="mt-10">
          <SignatureReveal
            src="/signature.svg"
            className="mb-4 h-20 object-cover -mx-6 hover:drop-shadow-[0_0_2px_#fff] transition-all duration-200 ease-out"
          />
        </motion.div>
        <motion.div
          className="text-2xl font-semibold flex flex-row justify-between items-start w-full"
          variants={fadeUp}
          transition={transition}
        >
          <h1>Conrad Crawford</h1>
          <div className="flex flex-row items-center gap-2 text-neutral-500 mt-1.5">
            <a
              href="https://github.com/cnrad"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity duration-150 ease-out"
            >
              <GithubIcon className="size-6 md:size-4" />
            </a>
            <a
              href="https://x.com/notcnrad"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity duration-150 ease-out"
            >
              <XTwitterIcon className="size-6 md:size-4" />
            </a>
            <a
              href="https://linkedin.com/in/cnrad"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity duration-150 ease-out"
            >
              <LinkedInIcon className="size-6 md:size-4" />
            </a>
          </div>
        </motion.div>
        <motion.p
          className="text-neutral-600 text-sm font-medium"
          variants={fadeUp}
          transition={transition}
        >
          cnrad
        </motion.p>
        <motion.div
          ref={containerRef}
          className="mt-4 w-full"
          variants={{ initial: {}, animate: {} }}
          style={{ height: maxHeight }}
        >
          <TextMorph text={description} className="text-sm text-neutral-400" />
        </motion.div>
        <motion.div
          variants={fadeUp}
          transition={transition}
          className="mt-8 mb-2 flex cursor-pointer flex-row items-center gap-3 text-sm text-neutral-600"
        >
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === "work" ? "/" : `/${item}`}
              className={`transition hover:text-neutral-400 ${
                (item === "work" && basePath === "/") || basePath === `/${item}`
                  ? "text-neutral-300"
                  : ""
              }`}
            >
              {item}
            </Link>
          ))}
        </motion.div>

        <motion.div
          className="w-full relative"
          variants={fadeUp}
          transition={transition}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname.split("/").slice(0, 2).join("/")}
              className="w-full origin-top"
              initial={{ opacity: 0, y: 2, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 2, filter: "blur(4px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <FrozenOutlet />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
