import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { WritingCanvas } from "./WritingCanvas";
import { Button } from "./stereo/Button";
import { cn } from "../../lib/utils";

// "Wiggle" stereoscopy: instead of showing both eye-views at once and asking you
// to fuse them, we show ONE at a time and flip between them. The two views are
// the same scene rendered from a viewpoint shifted left/right (a shifted
// perspective-origin), so flipping fast makes near things slide more than far
// things — and your brain reads that parallax as depth, no cross-eye required.
// Hold Left or Right to freeze a single perspective, or Play to alternate.

const PERSPECTIVE = 500;
const SEPARATION = 8; // px of viewpoint shift between the two perspectives

function Depth({
  z,
  className,
  style,
  children,
}: {
  z: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}

function Scene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center transform-3d">
      {/* far reference plane — the card parallaxes against these dots */}
      <div
        className="absolute inset-[-25%]"
        style={{
          transform: "translateZ(-55px)",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* the card, floating forward, with its own internal depth */}
      <div
        className="relative w-sm rounded-2xl border border-white/10 bg-neutral-950/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform-3d"
        style={{ transform: "translateZ(10px)" }}
      > 
        <Depth z={10}>
          <h4 className="text-md font-semibold text-neutral-100">
            Are you sure you want to leave?
          </h4>
        </Depth>
        <Depth z={4}>
          <p className="mt-1 text-[11px] leading-snug text-neutral-500">
            If you leave now, your changes will not be saved. 
          </p>
        </Depth>
        <Depth z={24}>
          <div className="mt-10 flex w-full flex-row gap-2">
            <Button variant="red" outerClassName="flex-1" className="text-xs whitespace-nowrap">
              Leave without saving
            </Button>
            <Button variant="black" outerClassName="flex-1" className="text-xs">
              Cancel
            </Button>
          </div>
        </Depth>
      </div>
    </div>
  );
}

// One control in the row. Snappy, responsive: colors settle in ≤0.15s ease-out,
// and it dips slightly on press so the click feels physical.
function CtrlButton({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-2 text-[12px] font-medium",
        "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]",
        active
          ? "border-neutral-600 bg-neutral-700 text-neutral-100"
          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200",
      )}
    >
      {children}
    </button>
  );
}

// A single eye glyph. `dim` fades it to 25% so a pair can show which eye's
// viewpoint a button represents — the lit eye is the one you're looking through.
function Eye({ dim }: { dim: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4 transition-opacity duration-150 ease-out", dim ? "opacity-25" : "opacity-100")}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Two eyes, lighting the left, the right, or both.
function EyePair({ side }: { side: "left" | "right" | "both" }) {
  return (
    <span className="flex items-center gap-1.5">
      <Eye dim={side === "right"} />
      <Eye dim={side === "left"} />
    </span>
  );
}

export function WiggleStereo() {
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<"left" | "right">("left");
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Only wiggle while on screen — no need to animate when nobody's looking.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const id = window.setInterval(
      () => setView((v) => (v === "left" ? "right" : "left")),
      150,
    );
    return () => window.clearInterval(id);
  }, [playing, inView]);

  const origin =
    view === "left"
      ? `calc(50% + ${SEPARATION}px) 50%`
      : `calc(50% - ${SEPARATION}px) 50%`;

  return (
    <WritingCanvas>
      <div
        ref={rootRef}
        className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
      >
        <div
          className="relative h-68 overflow-hidden"
          style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: origin }}
        >
          <Scene />
        </div>
        <div className="flex flex-col gap-3 border-t border-neutral-800 px-4 py-3.5">
          <p className="text-[12px] leading-snug text-neutral-500 mx-auto">
            The two perspectives are {SEPARATION}px apart. Can you begin to see the depth of certain elements?
          </p>
          <div className="flex gap-2">
            <CtrlButton
              active={!playing && view === "left"}
              ariaLabel="Left eye view"
              onClick={() => {
                setPlaying(false);
                setView("left");
              }}
            >
              <EyePair side="left" />
            </CtrlButton>
            <CtrlButton
              active={playing}
              ariaLabel={playing ? "Pause" : "Alternate views"}
              onClick={() => setPlaying((p) => !p)}
            >
              <EyePair side="both" />
            </CtrlButton>
            <CtrlButton
              active={!playing && view === "right"}
              ariaLabel="Right eye view"
              onClick={() => {
                setPlaying(false);
                setView("right");
              }}
            >
              <EyePair side="right" />
            </CtrlButton>
          </div>
        </div>
      </div>
    </WritingCanvas>
  );
}
