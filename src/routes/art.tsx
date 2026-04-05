import { useNavigate, useParams } from "react-router";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { WORKS, COLLECTIONS, type ArtPiece } from "../data/art";

function thumbUrl(href: string) {
  return href.replace("/art/min/", "/art/thumb/");
}

const loadedSrcs = new Set<string>();

const BlurImage = memo(function BlurImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(() => loadedSrcs.has(src));
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      loadedSrcs.add(src);
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative h-full w-full">
      {/* Tiny blurred placeholder — always visible underneath */}
      <img
        src={thumbUrl(src)}
        alt=""
        aria-hidden
        draggable={false}
        className={`${className} absolute inset-0`}
        style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
      />
      {/* Full image fades in on top */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        onLoad={() => {
          loadedSrcs.add(src);
          setLoaded(true);
        }}
        className={`${className} absolute inset-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
});

const FOCUSED_WIDTH = 350;
const FOCUSED_HEIGHT = 263; // 4:3 aspect
const UNFOCUSED_WIDTH = 238;
const UNFOCUSED_HEIGHT = 179;
const ANGLED_WIDTH = UNFOCUSED_WIDTH / 3; // ~1/3 width when at 70deg
const ROTATION_Y = 70; // degrees for side cards
const SIDE_GAP = 4; // tiny gap between stacked side cards
const N = WORKS.length;

/** Wraps any integer index into [0, N) */
function mod(i: number) {
  return ((i % N) + N) % N;
}

/**
 * Returns the shortest signed offset from `from` to `to` on a ring of size N.
 * Result is in (-N/2, N/2].
 */
function ringOffset(from: number, to: number) {
  const raw = mod(to) - mod(from);
  if (raw > N / 2) return raw - N;
  if (raw <= -N / 2) return raw + N;
  return raw;
}

function ArtViewer({
  piece,
  onClose,
  onPrev,
  onNext,
}: {
  piece: ArtPiece;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    dialogRef.current?.focus();
  }, [piece.slug]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={piece.name}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 outline-none"
        onClick={onClose}
      >
        <motion.div
          className="relative flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.26, 1, 0.6, 1] }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 rounded-full p-1.5 text-white/50 transition hover:text-white"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.img
              key={piece.slug}
              src={piece.href}
              alt={piece.name}
              className="max-h-[75vh] max-w-[90vw] rounded-xl object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </AnimatePresence>

          <motion.div
            className="mt-3 flex w-full max-w-lg items-center gap-3 rounded-xl border border-neutral-200/20 bg-black/25 px-2 py-2 backdrop-blur-md"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            <button
              onClick={onPrev}
              aria-label="Previous artwork"
              className="shrink-0 rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-medium text-white/90">
                {piece.name}
              </p>
              <p className="text-xs text-white/40">{piece.date}</p>
            </div>
            <button
              onClick={onNext}
              aria-label="Next artwork"
              className="shrink-0 rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </>,
    document.body,
  );
}

// How many slots to render on each side of the focused card
// Only render enough cards to fill the visible area — no need for all N
const VISIBLE_SIDE = Math.min(Math.ceil(N / 2), 12);

/** Compute x position for a card at a given offset from center */
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

export function Art() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const dragAccumulated = useRef(0);
  const dragThreshold = 80;

  const goNext = useCallback(() => setFocusedIndex((i) => i + 1), []);
  const goPrev = useCallback(() => setFocusedIndex((i) => i - 1), []);

  // Build virtual slots: a window of offsets centered on focusedIndex
  // Each slot is keyed by its offset so it never teleports
  const slots: { offset: number; virtualIndex: number; piece: ArtPiece }[] = [];
  for (let off = -VISIBLE_SIDE; off <= VISIBLE_SIDE; off++) {
    const vi = focusedIndex + off;
    slots.push({ offset: off, virtualIndex: vi, piece: WORKS[mod(vi)]! });
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (slug) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Enter") navigate(`/art/${WORKS[mod(focusedIndex)]!.slug}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, focusedIndex, navigate, goPrev, goNext]);

  // When viewer opens via URL, sync focused index
  useEffect(() => {
    if (slug) {
      const idx = WORKS.findIndex((w) => w.slug === slug);
      if (idx >= 0) setFocusedIndex(idx);
    }
  }, [slug]);

  // Drag / swipe handling (mouse + touch)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let pointerId: number | null = null;
    let startX = 0;
    let accumulated = 0;

    function onDown(e: PointerEvent) {
      if (slug) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      accumulated = 0;
      isDragging.current = false;
      dragAccumulated.current = 0;
      setIsPointerDown(true);
      el!.setPointerCapture(e.pointerId);
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
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [slug]);

  const handleCardClick = (offset: number, piece: ArtPiece) => {
    if (isDragging.current) return;
    if (offset === 0) {
      navigate(`/art/${piece.slug}`);
    } else {
      setFocusedIndex((i) => i + offset);
    }
  };

  // Horizontal scroll navigates carousel; temporarily pauses Lenis while active
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
      if (slug) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Start horizontal lock if x-dominant
      if (absX > absY && absX > 2) {
        if (!isHorizontalLocked) {
          isHorizontalLocked = true;
          lenis?.stop();
        }
        if (lockTimeout) clearTimeout(lockTimeout);
        lockTimeout = setTimeout(unlock, 150);
      }

      if (!isHorizontalLocked) return;

      // While locked, prevent all scrolling (including vertical)
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
  }, [slug, goNext, goPrev]);

  const focusedReal = mod(focusedIndex);
  const openPiece = slug ? WORKS.find((w) => w.slug === slug) : null;

  return (
    <>
      {/* Viewport-wide wrapper with fade masks on sides */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          touchAction: "pan-y",
          cursor: isPointerDown ? "grabbing" : "grab",
        }}
      >
        <div
          style={{
            maskImage:
              "linear-gradient(to right, transparent, transparent 10%, black 35%, black 65%, transparent 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, transparent 10%, black 35%, black 65%, transparent 90%, transparent)",
          }}
          className="max-md:mask-none!"
        >
          <div
            ref={containerRef}
            className="relative mx-auto w-full overflow-visible"
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
              // Eagerly load nearby images, lazy load distant ones
              const isNearby = absOffset <= 5;

              const w = isFocused ? FOCUSED_WIDTH : UNFOCUSED_WIDTH;
              const h = isFocused ? FOCUSED_HEIGHT : UNFOCUSED_HEIGHT;

              return (
                <motion.div
                  key={virtualIndex}
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
                  transition={{ duration: 0.5, ease: [0.26, 1, 0.6, 1] }}
                  onClick={() => handleCardClick(offset, piece)}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-xl ">
                    <BlurImage
                      src={piece.href}
                      alt={piece.name}
                      className="block h-full w-full rounded-xl object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-end rounded-xl bg-linear-to-t from-black/70 via-transparent to-transparent p-4 outline -outline-offset-1 outline-neutral-400/10"
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

      <div className="my-8 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-400">collections</h3>
        {COLLECTIONS.map((collection) => (
          <a
            key={collection.name}
            href={collection.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative h-32 overflow-hidden rounded-xl"
          >
            <div
              className="absolute inset-0 -z-1 bg-cover bg-center transition-all duration-500 ease-[cubic-bezier(0.26,1,0.6,1)] group-hover:scale-[1.03] group-hover:brightness-75"
              style={{ backgroundImage: `url(${collection.thumbnail})` }}
            />
            <div className="relative flex h-full flex-col justify-end bg-linear-to-t from-black/80 from-10% to-transparent p-5 -outline-offset-1 outline outline-neutral-500/10 group-hover:outline-neutral-500/20 rounded-xl transition-[outline] duration-200 ease-out">
              <h5 className="text-lg font-medium text-white">
                {collection.name}
              </h5>
              <p className="text-sm text-white/60">{collection.description}</p>
            </div>
          </a>
        ))}
      </div>

      <AnimatePresence>
        {openPiece && (
          <ArtViewer
            key="viewer"
            piece={openPiece}
            onClose={() => navigate("/art")}
            onPrev={() => {
              const prev = mod(focusedReal - 1);
              setFocusedIndex(prev);
              navigate(`/art/${WORKS[prev]!.slug}`, { replace: true });
            }}
            onNext={() => {
              const next = mod(focusedReal + 1);
              setFocusedIndex(next);
              navigate(`/art/${WORKS[next]!.slug}`, { replace: true });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
