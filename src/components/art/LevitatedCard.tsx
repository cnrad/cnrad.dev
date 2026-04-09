import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { EASE } from "../../lib/constants";
import type { ArtPiece } from "../../data/art";

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

export function LevitatedCard({
  piece,
  cardRect,
  onClose,
}: {
  piece: ArtPiece;
  cardRect: DOMRect;
  onClose: () => void;
}) {
  const target = computeTargetRect(piece);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

      <motion.div
        className="fixed z-50 cursor-default overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10"
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
        <img
          src={piece.href}
          alt={piece.name}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </motion.div>

      <motion.div
        className="fixed z-50 flex items-center justify-center gap-3 text-sm pointer-events-none"
        style={{
          left: target.left,
          width: target.width,
          top: target.top + target.height + 16,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <p className="font-medium text-neutral-200">{piece.name}</p>
        <p className="text-neutral-500">{piece.date}</p>
      </motion.div>
    </>,
    document.body,
  );
}
