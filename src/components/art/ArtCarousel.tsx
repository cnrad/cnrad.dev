import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WORKS, type ArtPiece } from "../../data/art";
import { cn } from "../../lib/utils";
import { EASE } from "../../lib/constants";
import { BlurImage, thumbUrl, carouselUrl } from "./BlurImage";
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
    preloadImage(thumbUrl(piece.href));
    preloadImage(carouselUrl(piece.href));
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

  // Preload focused + nearby images eagerly
  useEffect(() => {
    preloadAround(focusedIndex);
  }, [focusedIndex]);

  const slots: { offset: number; virtualIndex: number; piece: ArtPiece }[] = [];
  for (let off = -VISIBLE_SIDE; off <= VISIBLE_SIDE; off++) {
    const vi = focusedIndex + off;
    slots.push({ offset: off, virtualIndex: vi, piece: WORKS[mod(vi)]! });
  }

  // Keyboard navigation (only when not expanded — LevitatedCard handles its own keys)
  useEffect(() => {
    if (expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Enter") {
        const el = slotRefs.current.get(focusedIndex);
        setCardRect(el?.getBoundingClientRect() ?? null);
        setExpanded(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, expanded, focusedIndex]);

  // Drag / swipe handling (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const el = wrapperRef.current;
    if (!el) return;

    let pointerId: number | null = null;
    let startX = 0;
    let accumulated = 0;

    function onDown(e: PointerEvent) {
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
      if (Math.abs(dx) > 5) isDragging.current = true;

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

    el.addEventListener("pointerdown", onDown);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isMobile]);

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
    const lenis = (window as any).__lenis as
      | { stop: () => void; start: () => void }
      | undefined;
    let accumulated = 0;
    const threshold = 60;
    let isHorizontalLocked = false;
    let lockTimeout: ReturnType<typeof setTimeout> | null = null;

    function unlock() {
      isHorizontalLocked = false;
      accumulated = 0;
      lenis?.start();
    }

    function onWheel(e: WheelEvent) {
      if (expanded) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY && absX > 2) {
        if (!isHorizontalLocked) {
          isHorizontalLocked = true;
          lenis?.stop();
        }
        if (lockTimeout) clearTimeout(lockTimeout);
        lockTimeout = setTimeout(unlock, 150);
      }

      if (!isHorizontalLocked) return;

      e.preventDefault();
      accumulated += e.deltaX;
      if (accumulated > threshold) {
        goNext();
        accumulated = 0;
      } else if (accumulated < -threshold) {
        goPrev();
        accumulated = 0;
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (lockTimeout) clearTimeout(lockTimeout);
      if (isHorizontalLocked) lenis?.start();
    };
  }, [goNext, goPrev, expanded]);

  // Close expanded when navigating
  const prevFocusedIndex = useRef(focusedIndex);
  useEffect(() => {
    if (focusedIndex !== prevFocusedIndex.current) {
      setExpanded(false);
      prevFocusedIndex.current = focusedIndex;
    }
  }, [focusedIndex]);

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
              "relative mx-auto w-full",
              isMobile ? "overflow-hidden" : "overflow-visible",
            )}
            style={{
              height: FOCUSED_HEIGHT + 60,
              perspective: 1200,
              maxWidth: "42rem",
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
                >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <BlurImage
                      src={carouselUrl(piece.href)}
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
                      <p className="text-sm font-semibold text-white/85">
                        {piece.name}
                        {piece.featured ? " *" : ""}
                      </p>
                      <p className="text-xs text-white/40">{piece.date}</p>
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
            onClick={goPrev}
            className="hit-area-2 flex items-center justify-center size-8 rounded-full bg-neutral-800/60 text-neutral-400 active:bg-neutral-700/60 active:text-neutral-200 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
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
            key={focusedPiece.slug}
            piece={focusedPiece}
            cardRect={cardRect}
            onClose={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
