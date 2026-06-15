import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "../../lib/constants";
import type { ArtPiece } from "../../data/art";
import { previewUrl } from "./BlurImage";

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

const imageVariants = {
  enter: (dir: number) => ({
    x: dir * 40,
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    x: -dir * 40,
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
  }),
};

function PieceImage({ piece }: { piece: ArtPiece }) {
  const [fullLoaded, setFullLoaded] = useState(false);
  return (
    <>
      <img
        src={previewUrl(piece.href)}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={piece.href}
        alt={piece.name}
        draggable={false}
        onLoad={() => setFullLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
        style={{ opacity: fullLoaded ? 1 : 0 }}
      />
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
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    onNext();
  };
  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        setDirection(1);
        onNext();
      } else if (e.key === "ArrowLeft") {
        setDirection(-1);
        onPrev();
      }
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
        onClick={handlePrev}
        aria-label="Previous"
        className="fixed left-4 sm:left-8 top-1/2 z-50 -translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronLeft className="size-5" />
      </motion.button>

      <motion.button
        type="button"
        onClick={handleNext}
        aria-label="Next"
        className="fixed right-4 sm:right-8 top-1/2 z-50 -translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors backdrop-blur-md outline -outline-offset-1 outline-white/10"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <ChevronRight className="size-5" />
      </motion.button>

      <motion.div
        className="fixed z-50 cursor-default overflow-hidden outline -outline-offset-1 outline-white/10"
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
      >
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={piece.slug}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0"
          >
            <PieceImage piece={piece} />
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
