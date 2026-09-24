import {
  Depth,
  Selectable,
  StereoScene,
  useControl,
  useField,
} from "./stereo/engine";
import { Button } from "./stereo/Button";
import { cn } from "../../lib/utils";

// The modal — authored ONCE and handed to the stereo engine, which renders it as
// a stereo pair. Same design language as the WiggleStereo card: the dotted far
// plane, the near-black card, and the shared bevelled Button. Depth is declared
// with <Depth z>; every interactive bit reads engine state so it can be shared
// (seamless) or not (flickery) depending on the scene's `enableSync`.

function ModalContent() {
  const field = useField();
  const primary = useControl("rename");
  const cancel = useControl("cancel");

  return (
    <>
      {/* far reference plane — the card parallaxes against these dots */}
      <Depth
        z={-55}
        className="absolute inset-[-25%]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {null}
      </Depth>

      {/* the card, floating forward, with its own internal depth */}
      <Depth z={10}>
        {/* Same card as WiggleStereo's, sized for a half-width panel. */}
        <div className="w-[248px] rounded-2xl border border-white/10 bg-neutral-950/95 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform-3d selection:bg-transparent selection:text-inherit">
          <Depth z={10}>
            <Selectable id="heading">
              <h4 className="text-md font-semibold text-neutral-100">
                Rename this file?
              </h4>
            </Selectable>
          </Depth>
          <Depth z={4}>
            <Selectable id="desc" className="mt-1">
              <p className="text-[11px] leading-snug text-neutral-500">
                Pick a name you&apos;ll recognise later.
              </p>
            </Selectable>
          </Depth>

          {/* The field rests mid-depth and eases forward when hovered or focused. */}
          <Depth z={field.focused || field.hovered ? 44 : 28}>
            <input
              value={field.value}
              {...field.handlers}
              placeholder="untitled.md"
              className={cn(
                "mt-5 w-full rounded-[10px] border bg-white/[0.04] px-3.5 py-2 text-xs text-neutral-100 outline-none transition-colors placeholder:text-neutral-600",
                field.focused
                  ? "border-white/40 ring-2 ring-white/10"
                  : field.hovered
                    ? "border-white/25"
                    : "border-white/10",
              )}
            />
          </Depth>

          {/* Buttons take their hover/press from the store, not CSS :hover, so
              both eyes light up as one. */}
          <Depth z={40}>
            <div className="mt-6 flex w-full flex-row gap-2">
              <Button
                variant="blue"
                outerClassName="flex-1"
                className="text-xs"
                hovered={primary.hovered}
                pressed={primary.pressed}
                {...primary.handlers}
              >
                Rename
              </Button>
              <Button
                variant="black"
                outerClassName="flex-1"
                className="text-xs"
                hovered={cancel.hovered}
                pressed={cancel.pressed}
                {...cancel.handlers}
              >
                Cancel
              </Button>
            </div>
          </Depth>
        </div>
      </Depth>
    </>
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
