import { Depth, StereoScene, useControl, useField } from "./stereo/engine";
import { cn } from "../../lib/utils";

// A minimal, monochrome card — authored ONCE and handed to the stereo engine,
// which renders it as a stereo pair. Depth is declared with <Depth z>; every
// interactive bit reads engine state so it can be shared (seamless) or not
// (flickery) depending on the scene's `enableSync`.

function ModalContent() {
  const field = useField();
  const button = useControl("continue");

  return (
    // The card is the perspective "surface"; its children float in front of it.
    <div className="w-[240px] rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 p-5 shadow-[0_28px_60px_rgba(0,0,0,0.55)] [transform-style:preserve-3d]">
      <Depth z={10}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Stereo UI
        </div>
      </Depth>

      <Depth z={20}>
        <h3 className="mt-2 text-lg font-semibold text-neutral-100">
          Floating controls
        </h3>
      </Depth>

      <Depth z={8}>
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
          A field and a button, each sitting at its own depth.
        </p>
      </Depth>

      {/* The field rests mid-depth and eases forward when hovered or focused. */}
      <Depth z={field.focused || field.hovered ? 52 : 34}>
        <input
          value={field.value}
          {...field.handlers}
          placeholder="type here…"
          className={cn(
            "mt-4 w-full rounded-lg border bg-white/[0.04] px-3 py-2.5 text-xs text-neutral-100 outline-none transition-colors placeholder:text-neutral-600",
            field.focused
              ? "border-white/40 ring-2 ring-white/10"
              : field.hovered
                ? "border-white/25"
                : "border-white/10",
          )}
        />
      </Depth>

      {/* The button's hit-box stays at its depth (z=82); only the inner face
          sinks on hover/press. The cursor never has geometry move under it, so
          both copies stay in sync and the fused button doesn't flicker. */}
      <Depth z={48}>
        <button
          {...button.handlers}
          className="mt-4 block w-full [transform-style:preserve-3d]"
        >
          <span
            className="block rounded-lg bg-white py-2.5 text-center text-xs font-semibold text-neutral-950 transition-[transform,filter] duration-300"
            style={{
              transform: `translateZ(${button.pressed ? -30 : button.hovered ? -18 : 0}px)`,
              filter: button.pressed
                ? "brightness(0.88)"
                : button.hovered
                  ? "brightness(0.96)"
                  : "none",
            }}
          >
            Continue
          </span>
        </button>
      </Depth>
    </div>
  );
}

export function StereoModal({
  enableSync,
  showControls = false,
  // Legacy prop from the first draft: "seamless" → synced, anything else → not.
  variant,
}: {
  enableSync?: boolean;
  showControls?: boolean;
  variant?: string;
}) {
  const sync = enableSync ?? variant === "seamless";
  return (
    <StereoScene enableSync={sync} showControls={showControls}>
      <ModalContent />
    </StereoScene>
  );
}
