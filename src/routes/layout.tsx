import { Outlet, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef, useCallback, type ComponentType } from "react";
import { useOutlet } from "react-router";
import { prepare, layout } from "@chenglou/pretext";
import { SignatureReveal } from "../components/SignatureReveal";
import { TextMorph } from "../components/TextMorph";
import { GithubIcon, XTwitterIcon, LinkedInIcon } from "../icons";
import { EASE } from "../lib/constants";

const SOCIAL_LINKS: { href: string; icon: ComponentType<{ className?: string }>; label: string }[] = [
  { href: "https://github.com/cnrad", icon: GithubIcon, label: "GitHub" },
  { href: "https://x.com/notcnrad", icon: XTwitterIcon, label: "X / Twitter" },
  { href: "https://linkedin.com/in/cnrad", icon: LinkedInIcon, label: "LinkedIn" },
];

const fadeUp = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const transition = {
  duration: 0.8,
  ease: EASE,
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
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="opacity-50 hover:opacity-100 transition-opacity duration-150 ease-out"
              >
                <Icon className="size-6 md:size-4" />
              </a>
            ))}
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
