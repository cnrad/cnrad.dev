import { animate, motion } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DISCORD_ID } from "../lib/constants";
import type { LanyardData } from "../lib/lanyard";
import { cn } from "../lib/utils";

const SCROLL_SPEED = 30;
const PAUSE = 1;
const RETURN = 0.15;

const EDGE_MASK =
  "linear-gradient(to right, transparent, #000 var(--marquee-fade-left), #000 calc(100% - var(--marquee-fade-right)), transparent)";

function MarqueeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [hovered, setHovered] = useState(false);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setOverflow(Math.max(0, el.scrollWidth - el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || overflow === 0) return;

    if (hovered) {
      el.scrollLeft = 0;
      const controls = animate(0, overflow, {
        duration: overflow / SCROLL_SPEED,
        delay: PAUSE,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: PAUSE,
        onUpdate: (v) => {
          el.scrollLeft = v;
        },
      });
      return () => controls.stop();
    }

    if (el.scrollLeft > 0) {
      const controls = animate(el.scrollLeft, 0, {
        duration: RETURN,
        ease: [0, 0, 0.3, 1],
        onUpdate: (v) => {
          el.scrollLeft = v;
        },
      });
      return () => controls.stop();
    }
  }, [hovered, overflow]);

  return (
    <motion.div
      className={cn("relative w-full leading-none", className)}
      style={{ timelineScope: "--marquee" } as CSSProperties}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        ref={scrollRef}
        className="w-full overflow-x-hidden pointer-events-none select-none"
        style={
          {
            scrollTimelineName: "--marquee",
            scrollTimelineAxis: "inline",
            ...(overflow > 0 && {
              maskImage: EDGE_MASK,
              WebkitMaskImage: EDGE_MASK,
              animationName: "marqueeFadeLeft, marqueeFadeRight",
              animationDuration: "1ms, 1ms",
              animationFillMode: "both, both",
              animationTimeline: "--marquee, --marquee",
              animationRangeStart: "0%, 92%",
              animationRangeEnd: "8%, 100%",
            }),
          } as CSSProperties
        }
      >
        <span className="inline-block whitespace-nowrap">{text}</span>
      </div>
    </motion.div>
  );
}

export function SpotifyPresence() {
  const [activity, setActivity] = useState<LanyardData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const update = () =>
      fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setActivity(data.data);
        })
        .catch(() => {});

    const task = setInterval(update, 15 * 1000);
    update();
    return () => {
      controller.abort();
      clearInterval(task);
    };
  }, []);

  if (!activity?.listening_to_spotify) return null;

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(4px)", y: 4 }}
      transition={{ duration: 1.25, delay: 1.75, ease: [0.26, 1, 0.6, 1] }}
      className="max-sm:hidden flex flex-col mt-auto mb-6 origin-bottom"
    >
      <a
        href={`https://open.spotify.com/track/${activity.spotify.track_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-row items-end gap-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300 ease-out"
      >
        <div className="flex flex-col text-end sm:w-38 md:max-w-56 md:w-auto">
          <MarqueeText
            text={activity.spotify.song}
            className="text-white text-xs font-medium"
          />
          <MarqueeText
            text={activity.spotify.artist}
            className="text-neutral-500 text-xs"
          />
        </div>
        <img
          src={activity.spotify.album_art_url}
          width={56}
          height={56}
          alt={activity.spotify.album}
          fetchPriority="high"
          className="size-12 rounded-sm shadow-md select-none -outline-offset-1 outline outline-neutral-500/10 z-10"
          draggable={false}
        />

        <img
          src={activity.spotify.album_art_url}
          width={56}
          height={56}
          alt={activity.spotify.album}
          fetchPriority="high"
          className="size-12 scale-75 group-hover:scale-80 opacity-0 group-hover:opacity-100 rounded-md blur-[0.65rem] absolute right-0 top-1/2 -translate-y-1/2 z-8 transition-all duration-500 ease-out pointer-events-none"
          draggable={false}
        />

        <div className="absolute -top-0.5 right-1.25 -translate-1/2 shrink-0 z-12">
          <span className="absolute size-1.75 rounded-full bg-radial from-green-300 to-green-600" />
          <span className="absolute size-1.75 animate-ping rounded-full bg-[color(display-p3_0.385_0.8_0.414/1)] [animation-duration:2s]" />
        </div>
      </a>
    </motion.div>
  );
}
