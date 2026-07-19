import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "../../lib/constants";
import type { ArtPiece } from "../../data/art";
import { previewUrl, largeUrl } from "./BlurImage";

function computeTargetRect(piece: ArtPiece) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = piece.width / piece.height;

  const maxW = vw * 0.8;
  const maxH = vh * 0.8;

  let tw = Math.min(piece.width, maxW);
  let th = tw / aspect;

  if (th > maxH) {
    th = maxH;
    tw = th * aspect;
  }

  return {
    width: tw,
    height: th,
    left: (vw - tw) / 2,
    top: (vh - th) / 2,
  };
}

// Direction-agnostic crossfade: incoming and outgoing pieces only scale,
// blur, and fade — no left/right slide regardless of which arrow was used.
const imageVariants = {
  enter: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
  },
  center: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
  },
};

// `loadFull` gates the high-res load until the open animation finishes, so the
// expensive webp decode never competes with the opening transition for frames.
function PieceImage({
  piece,
  loadFull,
}: {
  piece: ArtPiece;
  loadFull: boolean;
}) {
  const [fullSrc, setFullSrc] = useState<string | null>(null);
  const [fullVisible, setFullVisible] = useState(false);

  useEffect(() => {
    if (!loadFull) return;
    let cancelled = false;
    const src = largeUrl(piece.href);
    const img = new Image();
    img.src = src;
    // Decode off the main paint path; only mount + fade in once it's ready.
    img
      .decode()
      .catch(() => {}) // decode() can reject (e.g. interrupted) — show it anyway
      .finally(() => {
        if (!cancelled) setFullSrc(src);
      });
    return () => {
      cancelled = true;
    };
  }, [loadFull, piece.href]);

  return (
    <>
      <img
        src={previewUrl(piece.href)}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {fullSrc && (
        <img
          src={fullSrc}
          alt={piece.name}
          draggable={false}
          onLoad={() => setFullVisible(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: fullVisible ? 1 : 0 }}
        />
      )}
    </>
  );
}

export function LevitatedCard({
  piece,
  cardRect,
  getSourceRect,
  onClose,
  onNext,
  onPrev,
}: {
  piece: ArtPiece;
  cardRect: DOMRect;
  getSourceRect: () => DOMRect | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  // Recomputed on resize (not just on piece change) so the expanded image stays
  // centered and correctly sized as the window changes size.
  const [target, setTarget] = useState(() => computeTargetRect(piece));

  useEffect(() => {
    setTarget(computeTargetRect(piece));
    let frame = 0;
    function recompute() {
      frame = 0;
      setTarget(computeTargetRect(piece));
    }
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(recompute);
    }
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [piece]);

  // The exit animation returns to the source card's *current* position. The
  // background can scroll (or resize) while the card is expanded, which moves
  // the fixed-positioned source card on screen, so we re-read its live rect
  // rather than reuse the rect captured at open time.
  const [exitRect, setExitRect] = useState(() => ({
    top: cardRect.top,
    left: cardRect.left,
    width: cardRect.width,
    height: cardRect.height,
  }));

  useEffect(() => {
    let frame = 0;
    function sync() {
      frame = 0;
      const r = getSourceRect();
      if (r) {
        setExitRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      }
    }
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [getSourceRect]);
  // Becomes true once the card has finished animating to its expanded size.
  // Gates the high-res image load so it doesn't stutter the open transition.
  const [opened, setOpened] = useState(false);

  // Fallback in case onAnimationComplete doesn't fire (e.g. reduced motion).
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 550);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      <motion.button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className="rounded-md fixed z-500 flex cursor-pointer items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 active:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10 bottom-4 left-4 h-20 w-[calc(50%-1.5rem)] pb-[env(safe-area-inset-bottom)] sm:bottom-auto sm:top-1/2 sm:left-8 sm:h-11 sm:w-11 sm:rounded-full sm:-translate-y-1/2 sm:pb-0"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronLeft className="size-7 sm:size-5" />
      </motion.button>

      <motion.button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="rounded-md fixed z-500 flex cursor-pointer items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 active:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10 bottom-4 right-4 h-20 w-[calc(50%-1.5rem)] pb-[env(safe-area-inset-bottom)] sm:bottom-auto sm:top-1/2 sm:right-8 sm:h-11 sm:w-11 sm:rounded-full sm:-translate-y-1/2 sm:pb-0"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronRight className="size-7 sm:size-5" />
      </motion.button>

      <motion.div
        className="fixed z-50 cursor-default overflow-hidden"
        initial={{
          top: cardRect.top,
          left: cardRect.left,
          width: cardRect.width,
          height: cardRect.height,
        }}
        animate={{
          top: target.top,
          left: target.left,
          width: target.width,
          height: target.height,
        }}
        exit={{
          top: exitRect.top,
          left: exitRect.left,
          width: exitRect.width,
          height: exitRect.height,
          opacity: 0,
          transition: {
            duration: 0.5,
            ease: EASE,
            opacity: { duration: 0.15, delay: 0.5, ease: "linear" },
          },
        }}
        transition={{ duration: 0.5, ease: EASE }}
        onAnimationComplete={() => setOpened(true)}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={piece.slug}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0"
          >
            <PieceImage piece={piece} loadFull={opened} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="fixed z-50 flex items-center justify-center gap-3 text-sm pointer-events-none"
        animate={{
          left: target.left,
          width: target.width,
          top: target.top + target.height + 16,
        }}
        transition={{ duration: 0.5, ease: EASE }}
        initial={{
          left: target.left,
          width: target.width,
          top: target.top + target.height + 16,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={piece.slug}
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <p className="font-medium text-neutral-200">{piece.name}</p>
            <p className="text-neutral-500">{piece.date}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>,
    document.body,
  );
}
