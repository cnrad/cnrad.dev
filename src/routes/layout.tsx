import { useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ComponentType,
} from "react";
import { useOutlet } from "react-router";
import { prepare, layout } from "@chenglou/pretext";
import { SignatureReveal } from "../components/SignatureReveal";
import { TextMorph } from "../components/TextMorph";
import { GithubIcon, XTwitterIcon, LinkedInIcon } from "../icons";
import { SpotifyPresence } from "../components/SpotifyPresence";
import { EASE } from "../lib/constants";
import { preloadCraftVideos, preloadArtImages } from "../lib/preload";

const SOCIAL_LINKS: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { href: "https://github.com/cnrad", icon: GithubIcon, label: "GitHub" },
  { href: "https://x.com/notcnrad", icon: XTwitterIcon, label: "X / Twitter" },
  {
    href: "https://linkedin.com/in/cnrad",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
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
  "/": "computers used to feel like magic. as more and more software shipped (faster than ever before), the bar for genuine care and craft seemed to disappear, and detail became an afterthought. i strive to bring that magic back - to make software *feel* great again.",
  "/craft":
    "great software has thoughtful consideration behind every detail of every interaction. the limitless and fascinating possibilities of human computer interaction are what make this possible. i explore what makes interactions feel *right*, and what the future of software could feel like.",
  "/art":
    "i enjoy digitally exploring abstract expressionism, with 5,000,000+ views and multiple features on [unsplash](https://unsplash.com/@cnrad) to my name. if you're interested in commissioning any work, [contact me](/more#email).",
  "/more":
    "a bit more about me — what i do outside of tech, and how to get in touch. feel free to reach out to talk software, share some music, or just say what's up.",
};

function stripMarkdownLite(s: string): string {
  return s
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

const allDescriptions = Object.values(pageDescriptions).map(stripMarkdownLite);
const navItems = ["work", "craft", "art", "more"];

// Layout's staggerChildren intro completes around ~2.05s after first mount.
// Children of the layout can read this flag to time their own entrance effects.
let layoutIntroComplete = false;
export const isLayoutIntroComplete = () => layoutIntroComplete;

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
    setMaxHeight(tallest + lineHeight);
  }, [lineHeight]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, maxHeight };
}

function useBodyNoise(size = 128) {
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const pxSize = Math.round(size * dpr);
    const canvas = document.createElement("canvas");
    canvas.width = pxSize;
    canvas.height = pxSize;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(pxSize, pxSize);
    const data = imageData.data;
    // Alpha ~4 matches the previous (alpha 18 * opacity 0.2) composite
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 4;
    }
    ctx.putImageData(imageData, 0, 0);
    const url = canvas.toDataURL("image/png");
    const prevImage = document.body.style.backgroundImage;
    const prevRepeat = document.body.style.backgroundRepeat;
    const prevSize = document.body.style.backgroundSize;
    const prevRendering = document.body.style.imageRendering;
    document.body.style.backgroundImage = `url(${url})`;
    document.body.style.backgroundRepeat = "repeat";
    document.body.style.backgroundSize = `${size}px ${size}px`;
    document.body.style.imageRendering = "pixelated";
    return () => {
      document.body.style.backgroundImage = prevImage;
      document.body.style.backgroundRepeat = prevRepeat;
      document.body.style.backgroundSize = prevSize;
      document.body.style.imageRendering = prevRendering;
    };
  }, [size]);
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

export function Layout() {
  const location = useLocation();
  useBodyNoise();
  const basePath = "/" + (location.pathname.split("/")[1] ?? "");

  useEffect(() => {
    if (layoutIntroComplete) return;
    const t = setTimeout(() => {
      layoutIntroComplete = true;
    }, 2100);
    return () => clearTimeout(t);
  }, []);

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
    <div
      className="relative text-white px-6 md:px-10 md:min-h-screen"
      style={{
        paddingBottom: "var(--craft-scroll-pad, 0px)",
        transition: "padding-bottom 0.35s cubic-bezier(0.26, 1, 0.6, 1)",
      }}
    >
      {/* Bottom progressive blur — desktop only; breaks iOS 26 liquid glass */}
      <motion.div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-20 max-md:hidden"
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
        className="relative mx-auto flex max-w-2xl flex-col items-start justify-start py-16 z-10 pb-20"
        style={{
          paddingTop: "calc(4rem + env(safe-area-inset-top))",
          paddingBottom: "calc(5rem + env(safe-area-inset-bottom) + 1.5rem)",
        }}
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.25 }}
      >
        <motion.div
          variants={fadeUp}
          transition={transition}
          className="mt-10 flex flex-row items-center justify-between w-full mb-4 "
        >
          <SignatureReveal
            src="/signature.svg"
            className="h-20 object-cover -mx-6"
          />
          <SpotifyPresence />
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
                className="opacity-50 hover:opacity-100 transition-opacity duration-150 ease-out hit-area-1"
              >
                <Icon className="size-5 md:size-4" />
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
          <TextMorph
            text={description}
            className="text-sm text-neutral-400 leading-5.5"
          />
        </motion.div>
        <motion.div
          variants={fadeUp}
          transition={transition}
          className="mt-4 md:mt-8 mb-2 flex cursor-pointer flex-row items-center gap-3 text-sm text-neutral-600"
        >
          {navItems.map((item) => {
            const preloadHandler =
              item === "craft"
                ? preloadCraftVideos
                : item === "art"
                  ? preloadArtImages
                  : undefined;
            return (
              <Link
                key={item}
                to={item === "work" ? "/" : `/${item}`}
                onMouseEnter={preloadHandler}
                onFocus={preloadHandler}
                className={`transition ${
                  (item === "work" && basePath === "/") ||
                  basePath === `/${item}`
                    ? "text-neutral-300 hover:text-neutral-300 font-medium"
                    : "hover:text-neutral-400"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          className="w-full relative"
          variants={fadeUp}
          transition={transition}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname.split("/").slice(0, 2).join("/")}
              className="w-full origin-top stagger-children"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
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
