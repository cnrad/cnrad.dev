import type { CSSProperties, ReactNode } from "react";
import { StereoScene, useControl } from "./stereo/engine";
import { cn } from "../../lib/utils";

// A modal whose buttons are real extruded 3D blocks — a front face plus four
// side walls — so the stereo perspective makes them physically stand off the
// card. On hover the whole block rises toward you; pressing sinks it. Every
// block stays well under the cursor's depth plane (see the note in the post),
// so the pointer is always the frontmost thing and the fusion holds.

// One extruded block: back sits at the container's z, front at z + `depth`.
function Box3D({
  depth,
  lift,
  faceClassName,
  children,
  style,
}: {
  depth: number;
  lift: number;
  faceClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const wall = "absolute";
  return (
    <div
      className="relative [transform-style:preserve-3d]"
      style={{
        ...style,
        transform: `translateZ(${lift}px)`,
        transition: "transform .18s cubic-bezier(.2,.8,.3,1)",
      }}
    >
      {/* side walls (shaded to fake a top-left light) */}
      <div
        className={wall}
        style={{ top: 0, right: 0, width: depth, height: "100%", transformOrigin: "100% 50%", transform: "rotateY(90deg)", background: "#2b2b30" }}
      />
      <div
        className={wall}
        style={{ top: 0, left: 0, width: depth, height: "100%", transformOrigin: "0 50%", transform: "rotateY(-90deg)", background: "#3a3a40" }}
      />
      <div
        className={wall}
        style={{ top: 0, left: 0, width: "100%", height: depth, transformOrigin: "50% 0", transform: "rotateX(90deg)", background: "#46464d" }}
      />
      <div
        className={wall}
        style={{ bottom: 0, left: 0, width: "100%", height: depth, transformOrigin: "50% 100%", transform: "rotateX(-90deg)", background: "#202024" }}
      />
      {/* front face */}
      <div
        className={cn("absolute inset-0 flex items-center justify-center", faceClassName)}
        style={{ transform: `translateZ(${depth}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

function Button3D({
  id,
  depth = 16,
  primary = false,
  children,
}: {
  id: string;
  depth?: number;
  primary?: boolean;
  children: ReactNode;
}) {
  const { hovered, pressed, handlers } = useControl(id);
  const lift = pressed ? -6 : hovered ? 12 : 0;
  return (
    <div {...handlers} className="h-10 w-full cursor-pointer [transform-style:preserve-3d]">
      <Box3D
        depth={depth}
        lift={lift}
        style={{ width: "100%", height: "100%" }}
        faceClassName={cn(
          "rounded-[7px] text-xs font-semibold",
          primary
            ? "bg-white text-neutral-950"
            : "border border-white/10 bg-neutral-800 text-neutral-200",
        )}
      >
        {children}
      </Box3D>
    </div>
  );
}

function ModalContent() {
  return (
    // Tilt the card back a touch so the extruded blocks show their side walls —
    // a straight-on extrusion only reveals its front face.
    <div
      className="w-[220px] rounded-2xl border border-white/10 bg-neutral-900 p-5 [transform-style:preserve-3d]"
      style={{ transform: "rotateX(16deg)" }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        Deploy
      </div>
      <h3 className="mt-2 text-base font-semibold text-neutral-100">
        Ship to production?
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
        These buttons are extruded blocks — they physically stand off the card.
      </p>
      <div className="mt-4 flex flex-col gap-2.5 [transform-style:preserve-3d]">
        <Button3D id="confirm" depth={24} primary>
          Deploy
        </Button3D>
        <Button3D id="cancel" depth={16}>
          Cancel
        </Button3D>
      </div>
    </div>
  );
}

export function Modal3D({
  enableSync = true,
  showControls = true,
}: {
  enableSync?: boolean;
  showControls?: boolean;
}) {
  return (
    <StereoScene enableSync={enableSync} showControls={showControls} height={340}>
      <ModalContent />
    </StereoScene>
  );
}
