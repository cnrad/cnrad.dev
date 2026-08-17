import { useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  type ComponentType,
} from "react";
import { useOutlet } from "react-router";
import { prepare, layout } from "@chenglou/pretext";
import { SignatureReveal } from "../components/SignatureReveal";
import { TextMorph } from "../components/TextMorph";
import { GithubIcon, XTwitterIcon, LinkedInIcon } from "../icons";
import { SpotifyPresence } from "../components/SpotifyPresence";
import { NoiseBackground } from "../components/NoiseBackground";
import { WritingOverlay } from "../components/WritingOverlay";
import { EASE } from "../lib/constants";
import { preloadCraftVideos, preloadArtImages } from "../lib/preload";
import { playSound, preloadSound } from "../lib/sound";

const CLICK_SOUND = "/click.wav";

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
  "/": "computers used to feel like magic. as more and more software ships, faster than ever before, the bar for genuine care and craft is often forgotten in the search for velocity. i develop polished web experiences to bring that magic back; to make software *feel* great again.",
  "/craft":
    "great software has thoughtful consideration behind every pixel and every interaction. i ship the details that make software feel intuitive, and *right*. the possibilities of human computer interaction are limitless — the best interfaces haven't been built yet.",
  "/art":
    "i digitally explore abstract expressionism, with 5,000,000+ views and multiple features on [unsplash](https://unsplash.com/@cnrad) to my name. if you're interested in commissioning work, [contact me](/more#email).",
  "/more":
    "a bit more about me — what i do outside of tech, and how to get in touch. feel free to reach out to talk software, share some music, or just say what's up.",
};

function stripMarkdownLite(s: string): string {
  return s
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/==([^=]+)==/g, "$1");
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
  const preparedTexts = useMemo(
    () => allDescriptions.map((t) => prepare(t, font)),
    [font],
  );

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;

    let tallest = 0;
    for (const prepared of preparedTexts) {
      const { height } = layout(prepared, width, lineHeight);
      if (height > tallest) tallest = height;
    }
    setMaxHeight(tallest + lineHeight);
  }, [lineHeight, preparedTexts]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, maxHeight };
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
  const basePath = "/" + (location.pathname.split("/")[1] ?? "");

  // A writing post renders as a full-screen overlay layer on top of the site,
  // not as a page in the content column. While it's open we hold the column on
  // the page it was launched from (the "background" base path) so the site
  // behind the overlay stays put and doesn't crossfade.
  const isWriting = basePath === "/writing";
  // Seed with the real base path — even on a direct /writing load. Forcing "/"
  // here would make the column's AnimatePresence key already "/", so navigating
  // home wouldn't change the key, the column wouldn't remount, and FrozenOutlet
  // would keep returning the stale (null) writing outlet — leaving home blank.
  const bgBasePath = useRef(basePath);
  if (!isWriting) bgBasePath.current = basePath;
  const writingSlug = isWriting
    ? (location.pathname.split("/")[2] ?? null)
    : null;

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
    const wasWriting = prevBasePath.current === "/writing";
    prevBasePath.current = basePath;
    // Don't move the background when the overlay opens or closes — keep the
    // reader's place in the page behind it.
    if (basePath === "/writing" || wasWriting) return;
    if (window.scrollY === 0) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [basePath]);
  // Use the background page's description, not the writing route's — the header
  // is hidden behind the overlay while a post is open, so morphing it there
  // would just replay the animation when the reader returns. Holding it means
  // the site is already settled and static underneath.
  const description =
    pageDescriptions[bgBasePath.current] ?? pageDescriptions["/"]!;
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
      <NoiseBackground />

      {/* Content */}
      <motion.div
        className="relative mx-auto flex max-w-2xl flex-col items-start justify-start py-8 md:py-16 z-10 pb-20"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.25 }}
      >
        <motion.div
          variants={fadeUp}
          transition={transition}
          className="mt-10 flex flex-row items-center justify-between w-full mb-4"
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
          className="mt-8 mb-2 flex cursor-pointer flex-row items-center gap-3 text-sm text-neutral-600"
        >
          {navItems.map((item) => {
            const target = item === "work" ? "/" : `/${item}`;
            const isActive =
              (item === "work" && basePath === "/") || basePath === `/${item}`;
            const preloadHandler =
              item === "craft"
                ? preloadCraftVideos
                : item === "art"
                  ? preloadArtImages
                  : undefined;
            const handleMouseEnter = () => {
              preloadHandler?.();
              preloadSound(CLICK_SOUND);
            };
            return (
              <Link
                key={item}
                to={target}
                onMouseEnter={handleMouseEnter}
                onFocus={preloadHandler}
                onClick={() => {
                  if (!isActive) playSound(CLICK_SOUND);
                }}
                className={`transition ${
                  isActive
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
              key={bgBasePath.current}
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

      <WritingOverlay slug={writingSlug} backTo={bgBasePath.current} />
    </div>
  );
}
