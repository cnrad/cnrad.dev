import { useState } from "react";
import { WritingCanvas } from "./WritingCanvas";
import { Slider } from "./stereo/engine";
import { cn } from "../../lib/utils";

// A rehearsal for cross-eye viewing: what you'll actually SEE as you cross your
// eyes at a stereo pair, so you know what to aim for before trying it on the
// real thing. Two "images" sit side by side. Crossing your eyes shows each one
// twice — once per eye — and the copies slide apart in opposite directions: the
// left eye's view shifts right, the right eye's shifts left. Slide to cross:
//   0        → relaxed, two images
//   0 → ½    → four images, the inner pair drifting toward each other
//   ½        → the inner pair lands on top of itself: three images, the middle
//              one fused — this is the sweet spot (the notch)
//   ½ → 1    → too far, the inner pair crosses past and you're back to four

const IMG_W = 96;
const IMG_H = 68;
const D = 64; // half the distance between the two source images' centres

function Ghost({ x, fused }: { x: number; fused: boolean }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 flex justify-center rounded-lg border",
        fused ? "border-neutral-400/60" : "border-neutral-500/40",
      )}
      style={{
        width: IMG_W,
        height: IMG_H,
        // Each copy is one eye's view: half-strength on its own, so where two
        // coincide they add up to a solid, "fused" image.
        background: "rgba(163,163,163,0.42)",
        transform: `translate(calc(-50% + ${x}px), -50%)`,
      }}
    >
      <div className="mt-1.5 size-1.5 rounded-full bg-neutral-200/80" />
    </div>
  );
}

const describe = (t: number) => {
  if (t < 0.03) return "Relaxed — two images";
  if (Math.abs(t - 0.5) <= 0.03) return "Fused — focus on the middle one";
  if (t < 0.5) return "Crossing — four images";
  if (t > 0.97) return "Fully crossed — four images";
  return "Too far — the inner pair crossed past";
};

export function CrossEyeDemo() {
  const [t, setT] = useState(0);
  // Total shift between the two eyes' views. At t = ½ it equals the distance
  // between the sources (2D), which is exactly when the inner pair coincides.
  const s = t * 4 * D;
  const fused = Math.abs(t - 0.5) <= 0.03;

  // Each source seen by each eye: left eye's view shifted right by s/2, right
  // eye's view shifted left by s/2.
  const copies = [
    { key: "L-left", x: -D + s / 2 },
    { key: "L-right", x: -D - s / 2 },
    { key: "R-left", x: D + s / 2 },
    { key: "R-right", x: D - s / 2 },
  ];

  return (
    <WritingCanvas>
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="relative h-[200px] overflow-hidden">
          {copies.map((c) => (
            <Ghost key={c.key} x={c.x} fused={fused} />
          ))}
        </div>
        <div className="border-t border-neutral-800 px-4 pt-3 pb-2.5">
          <Slider
            label="Use the slider to simulate the effect"
            labelClassName="mt-1"
            value={t}
            min={0}
            max={1}
            step={0.01}
            onChange={setT}
            defaultValue={0}
            format={describe}
            tall
            notch={0.5}
          />
        </div>
      </div>
    </WritingCanvas>
  );
}
