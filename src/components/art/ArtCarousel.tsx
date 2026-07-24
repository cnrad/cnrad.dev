import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WORKS, type ArtPiece } from "../../data/art";
import { cn } from "../../lib/utils";
import { EASE } from "../../lib/constants";
import { BlurImage, previewUrl } from "./BlurImage";
import { LevitatedCard } from "./LevitatedCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const preloadCache = new Set<string>();

function preloadImage(src: string) {
  if (preloadCache.has(src)) return;
  preloadCache.add(src);
  const img = new Image();
  img.src = src;
}

const PRELOAD_AHEAD = 3;

function preloadAround(index: number) {
  for (let off = -PRELOAD_AHEAD; off <= PRELOAD_AHEAD; off++) {
    const piece =
      WORKS[(((index + off) % WORKS.length) + WORKS.length) % WORKS.length]!;
    preloadImage(previewUrl(piece.href));
  }
}

const FOCUSED_WIDTH = 350;
const FOCUSED_HEIGHT = 263; // 4:3 aspect
const UNFOCUSED_WIDTH = 238;
const UNFOCUSED_HEIGHT = 179;
const ANGLED_WIDTH = UNFOCUSED_WIDTH / 3;
const ROTATION_Y = 70;
const SIDE_GAP = 4;
const N = WORKS.length;

function mod(i: number) {
  return ((i % N) + N) % N;
}

const VISIBLE_SIDE = Math.min(Math.ceil(N / 2), 12);

function offsetToX(offset: number) {
  if (offset === 0) return 0;
  const halfFocused = FOCUSED_WIDTH / 2;
  const gap = 16;
  if (offset < 0) {
    const distFromEdge = Math.abs(offset) - 1;
    return -(
      halfFocused +
      gap +
      ANGLED_WIDTH / 2 +
      distFromEdge * (ANGLED_WIDTH + SIDE_GAP)
    );
  } else {
    const distFromEdge = offset - 1;
    return (
      halfFocused +
      gap +
      ANGLED_WIDTH / 2 +
      distFromEdge * (ANGLED_WIDTH + SIDE_GAP)
    );
  }
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export function ArtCarousel() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isDragging = useRef(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const dragAccumulated = useRef(0);
  const dragThreshold = 80;
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();

  const goNext = useCallback(() => setFocusedIndex((i) => i + 1), []);
  const goPrev = useCallback(() => setFocusedIndex((i) => i - 1), []);

  // Live rect of the currently-focused card, read on demand. The expanded
  // card animates back to this on close, so it must reflect the card's current
  // on-screen position (e.g. after the background scrolled), not a stale capture.
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;
  const getSourceRect = useCallback(
    () =>
      slotRefs.current.get(focusedIndexRef.current)?.getBoundingClientRect() ??
      null,
    [],
  );

  const openFocused = useCallback(() => {
    const el = slotRefs.current.get(focusedIndexRef.current);
    setCardRect(el?.getBoundingClientRect() ?? null);
    setExpanded(true);
  }, []);

  // Preload focused + nearby images eagerly
  useEffect(() => {
    preloadAround(focusedIndex);
  }, [focusedIndex]);

  // Close the expanded view when the tab is hidden — returning to it later
  // means re-decoding the large image, which leaves a blank card for seconds.
  useEffect(() => {
    if (!expanded) return;
    function onVisibilityChange() {
      if (document.hidden) setExpanded(false);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [expanded]);

  const slots: { offset: number; virtualIndex: number; piece: ArtPiece }[] = [];
  for (let off = -VISIBLE_SIDE; off <= VISIBLE_SIDE; off++) {
    const vi = focusedIndex + off;
    slots.push({ offset: off, virtualIndex: vi, piece: WORKS[mod(vi)]! });
  }

  // Arrow-key navigation (only when not expanded — LevitatedCard handles its own
  // keys). Enter/Space to open is handled on the focused card itself so it only
  // fires when that card is actually focused, not globally (e.g. from the nav).
  useEffect(() => {
    if (expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, expanded]);

  // Drag / swipe handling (desktop pointer drag + mobile touch swipe).
  // touchAction: "pan-y" on the wrapper lets the browser keep vertical page
  // scrolling while horizontal gestures are delivered here as pointer events.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let pointerId: number | null = null;
    let startX = 0;
    let accumulated = 0;

    function onDown(e: PointerEvent) {
      // Deliberately no setPointerCapture / preventDefault here: capturing on
      // pointerdown retargets the synthesized click to this wrapper (breaking
      // the focused card's onClick), and preventDefault suppresses the touch
      // tap's click — both killed click/tap-to-expand. We defer both to onMove,
      // once an actual drag begins, so a plain press still opens the card.
      pointerId = e.pointerId;
      startX = e.clientX;
      accumulated = 0;
      isDragging.current = false;
      dragAccumulated.current = 0;
      setIsPointerDown(true);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !isDragging.current) {
        isDragging.current = true;
        // Now it's a real drag: capture the pointer and cancel the native
        // press/selection gesture (the Safari edge auto-scroll fix). Doing this
        // only after movement is what keeps a plain click/tap opening the card.
        try {
          el?.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
      if (isDragging.current) e.preventDefault();

      accumulated = dx;
      const steps = Math.trunc(accumulated / dragThreshold);
      if (steps !== dragAccumulated.current) {
        const delta = steps - dragAccumulated.current;
        dragAccumulated.current = steps;
        setFocusedIndex((i) => i - delta);
      }
    }

    function onUp(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      setIsPointerDown(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    }

    el.addEventListener("pointerdown", onDown, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const handleCardClick = (
    offset: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (isDragging.current) return;
    if (offset === 0) {
      setCardRect(e.currentTarget.getBoundingClientRect());
      setExpanded(true);
    } else {
      setFocusedIndex((i) => i + offset);
    }
  };

  // Horizontal scroll
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let accumulated = 0;
    const threshold = 60;
    const minStepInterval = 30; // ms — caps scroll speed so paints/preloads keep up
    let lastStepTime = 0;
    let isHorizontalLocked = false;
    let lockTimeout: ReturnType<typeof setTimeout> | null = null;

    function unlock() {
      isHorizontalLocked = false;
      accumulated = 0;
    }

    function onWheel(e: WheelEvent) {
      if (expanded) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY && absX > 2) {
        isHorizontalLocked = true;
        if (lockTimeout) clearTimeout(lockTimeout);
        lockTimeout = setTimeout(unlock, 150);
      }

      if (!isHorizontalLocked) return;

      e.preventDefault();
      accumulated += e.deltaX;
      if (Math.abs(accumulated) > threshold) {
        const now = performance.now();
        if (now - lastStepTime < minStepInterval) {
          // clamp so a fast fling can't queue a burst of steps
          accumulated = Math.sign(accumulated) * threshold;
          return;
        }
        lastStepTime = now;
        if (accumulated > 0) goNext();
        else goPrev();
        accumulated = 0;
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (lockTimeout) clearTimeout(lockTimeout);
    };
  }, [goNext, goPrev, expanded]);

  const focusedPiece = WORKS[mod(focusedIndex)]!;

  return (
    <>
      {/* Viewport-wide wrapper */}
      <div
        ref={wrapperRef}
        className={cn("relative", isMobile && "overflow-hidden")}
        style={{
          width: isMobile ? "100vw" : "min(100vw, 1200px)",
          marginLeft: isMobile
            ? "calc(-1.5rem - env(safe-area-inset-left))"
            : "calc(-1 * (min(100vw, 1200px) - 100%) / 2)",
          touchAction: "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: isMobile ? "default" : isPointerDown ? "grabbing" : "grab",
        }}
      >
        <div
          style={
            isMobile
              ? undefined
              : {
                  maskImage:
                    "linear-gradient(to right, transparent, transparent 10%, black 35%, black 65%, transparent 90%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, transparent 10%, black 35%, black 65%, transparent 90%, transparent)",
                }
          }
        >
          <div
            ref={containerRef}
            className={cn(
              "relative md:mx-auto w-full md:max-w-2xl",
              isMobile ? "overflow-hidden" : "overflow-visible",
            )}
            style={{
              height: FOCUSED_HEIGHT + 60,
              perspective: 1200,
            }}
          >
            {slots.map(({ offset, virtualIndex, piece }) => {
              const isFocused = offset === 0;
              const absOffset = Math.abs(offset);
              const cardX = offsetToX(offset);
              const rotateY = isFocused
                ? 0
                : offset < 0
                  ? ROTATION_Y
                  : -ROTATION_Y;
              const zIndex = N - absOffset;

              const w = isFocused ? FOCUSED_WIDTH : UNFOCUSED_WIDTH;
              const h = isFocused ? FOCUSED_HEIGHT : UNFOCUSED_HEIGHT;

              return (
                <motion.div
                  key={virtualIndex}
                  ref={(el) => {
                    if (el) slotRefs.current.set(virtualIndex, el);
                    else slotRefs.current.delete(virtualIndex);
                  }}
                  className="absolute select-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    transformStyle: "preserve-3d",
                    zIndex,
                    willChange: "transform, width, height",
                  }}
                  initial={false}
                  animate={{
                    x: cardX,
                    width: w,
                    height: h,
                    marginLeft: -w / 2,
                    marginTop: -h / 2,
                    rotateY,
                    filter: isFocused ? "brightness(1)" : "brightness(0.4)",
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                  onClick={(e) => handleCardClick(offset, e)}
                  tabIndex={isFocused ? 0 : -1}
                  role={isFocused ? "button" : undefined}
                  aria-label={isFocused ? `Expand ${piece.name}` : undefined}
                  onKeyDown={
                    isFocused
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openFocused();
                          }
                        }
                      : undefined
                  }
                >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <BlurImage
                      src={previewUrl(piece.href)}
                      alt={piece.name}
                      className="block h-full w-full rounded-xl object-cover"
                    />
                    <motion.div
                      className={cn(
                        "absolute inset-0 flex flex-col justify-end rounded-xl bg-linear-to-t from-black/70 via-transparent to-transparent p-4 outline -outline-offset-1 outline-neutral-400/10 transition-[outline] duration-150 ease-out",
                        {
                          "hover:outline-neutral-400/20": offset === 0,
                        },
                      )}
                      initial={false}
                      animate={{ opacity: isFocused ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs text-white/50">{piece.date}</p>
                      <p className="text-sm font-semibold text-white/85">
                        {piece.name}
                        {piece.featured ? " *" : ""}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile navigation buttons */}
      {isMobile ? (
        <div className="flex items-center justify-between w-full mt-2">
          <button
            type="button"
            onClick={goPrev}
            className="hit-area-2 flex items-center justify-center size-8 rounded-full bg-neutral-800/60 text-neutral-400 active:bg-neutral-700/60 active:text-neutral-200 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="hit-area-2 flex items-center justify-center size-8 rounded-full bg-neutral-800/60 text-neutral-400 active:bg-neutral-700/60 active:text-neutral-200 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}

      {/* Levitated card — portaled to body so it escapes all stacking contexts */}
      <AnimatePresence>
        {expanded && cardRect && (
          <LevitatedCard
            piece={focusedPiece}
            cardRect={cardRect}
            getSourceRect={getSourceRect}
            onClose={() => setExpanded(false)}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}
      </AnimatePresence>
    </>
  );
}
