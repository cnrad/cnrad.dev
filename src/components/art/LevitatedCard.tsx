import { useEffect, useMemo, useState } from "react";
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
  onClose,
  onNext,
  onPrev,
}: {
  piece: ArtPiece;
  cardRect: DOMRect;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const target = useMemo(() => computeTargetRect(piece), [piece]);
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
        className="fixed left-4 sm:left-8 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-auto sm:top-1/2 z-50 sm:-translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronLeft className="size-5" />
      </motion.button>

      <motion.button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="fixed right-4 sm:right-8 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-auto sm:top-1/2 z-50 sm:-translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronRight className="size-5" />
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
          top: cardRect.top,
          left: cardRect.left,
          width: cardRect.width,
          height: cardRect.height,
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
