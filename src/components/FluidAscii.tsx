import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

const CHARS = " .,-~:;=!*#$@";

// Perlin 2D (gradient noise). Unlike value noise, this samples gradient
// vectors at each lattice point rather than scalar values — the result has
// no axis-aligned blocky artifacts and produces the smooth, organic
// "fields-and-currents" look that suits a fluid surface.
const PERM = (() => {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Deterministic LCG shuffle so the texture is stable across reloads.
  let s = 1234567;
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = (s >>> 0) % (i + 1);
    const t = p[i]!;
    p[i] = p[j]!;
    p[j] = t;
  }
  const ext = new Uint8Array(512);
  for (let i = 0; i < 512; i++) ext[i] = p[i & 255]!;
  return ext;
})();

// 8 unit-length-ish gradient directions packed as parallel arrays.
const GX = [1, -1, 1, -1, 1, -1, 0, 0];
const GY = [1, 1, -1, -1, 0, 0, 1, -1];

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function perlin2(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = PERM[X + PERM[Y]!]! & 7;
  const ab = PERM[X + PERM[Y + 1]!]! & 7;
  const ba = PERM[X + 1 + PERM[Y]!]! & 7;
  const bb = PERM[X + 1 + PERM[Y + 1]!]! & 7;
  const n00 = GX[aa]! * xf + GY[aa]! * yf;
  const n10 = GX[ba]! * (xf - 1) + GY[ba]! * yf;
  const n01 = GX[ab]! * xf + GY[ab]! * (yf - 1);
  const n11 = GX[bb]! * (xf - 1) + GY[bb]! * (yf - 1);
  const x1 = n00 + u * (n10 - n00);
  const x2 = n01 + u * (n11 - n01);
  // Perlin 2D peaks around ±0.707; map to [0, 1].
  return (x1 + v * (x2 - x1)) * 0.7071 + 0.5;
}

// Lower lacunarity (1.7 vs the usual 2.0) keeps each octave closer in
// frequency to the previous one — the high-frequency crunch is softened
// and the resulting field looks smoother and more continuous.
function fbm(x: number, y: number): number {
  let v = 0;
  let a = 0.55;
  for (let i = 0; i < 3; i++) {
    v += a * perlin2(x, y);
    x *= 1.7;
    y *= 1.7;
    a *= 0.5;
  }
  return v;
}

/**
 * The base "water surface" is domain-warped FBM that flows slowly on its own.
 * A separate scalar wave field (classic 2D ripple algorithm) carries the
 * cursor's disturbance — each frame the cursor deposits height into the field,
 * which then propagates as circular waves, reflects off the edges, and decays.
 * The ripple field warps the noise sampling AND adds its own visible amplitude,
 * so the noise visually "parts" around the cursor like water around a finger.
 */
// Per-character brightness is faked with a small stack of <pre> layers at
// fixed opacities. Each character is written into exactly one layer based on
// its ripple intensity, so the base noise sits at 20% white and a passing
// ripple promotes those characters up to 100% — then back down as the wave
// decays. Cheaper than per-character spans, and the discrete steps read as a
// smooth flash at this density.
const LAYER_OPACITY = [0.2, 0.4, 0.6, 0.8, 1];
const NLAYERS = LAYER_OPACITY.length;

export function FluidAscii({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRefs = useRef<(HTMLPreElement | null)[]>([]);
  const mouseRef = useRef({
    x: -1,
    y: -1,
    px: -1,
    py: -1,
    active: false,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pres = preRefs.current;

    let cols = 0;
    let rows = 0;
    let charW = 0;
    let charH = 0;

    // Wave-equation buffers (height field, two-step integration).
    let prev = new Float32Array(0);
    let curr = new Float32Array(0);
    let nextBuf = new Float32Array(0);

    let raf = 0;

    function measure() {
      const probe = document.createElement("span");
      probe.textContent = "M";
      probe.style.visibility = "hidden";
      probe.style.position = "absolute";
      probe.style.whiteSpace = "pre";
      el!.appendChild(probe);
      const r = probe.getBoundingClientRect();
      charW = r.width;
      charH = r.height;
      el!.removeChild(probe);
      const box = el!.getBoundingClientRect();
      cols = Math.max(4, Math.floor(box.width / charW));
      rows = Math.max(4, Math.floor(box.height / charH));
      const n = cols * rows;
      prev = new Float32Array(n);
      curr = new Float32Array(n);
      nextBuf = new Float32Array(n);
    }
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (mouseRef.current.x < 0) {
        mouseRef.current.px = x;
        mouseRef.current.py = y;
      }
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.active = x > 0 && x < 1 && y > 0 && y < 1;
    }
    function onLeave() {
      mouseRef.current.active = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    function drop(cx: number, cy: number, amount: number, radius: number) {
      const r2 = radius * radius;
      const xMin = Math.max(1, Math.floor(cx - radius));
      const xMax = Math.min(cols - 2, Math.ceil(cx + radius));
      const yMin = Math.max(1, Math.floor(cy - radius));
      const yMax = Math.min(rows - 2, Math.ceil(cy + radius));
      for (let y = yMin; y <= yMax; y++) {
        for (let x = xMin; x <= xMax; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;
          const f = 1 - Math.sqrt(d2) / radius;
          curr[y * cols + x]! += amount * f * f;
        }
      }
    }

    const start = performance.now();

    function frame() {
      const t = (performance.now() - start) / 1000;
      const m = mouseRef.current;

      // 1. Cursor displaces water only when it moves — finger held still in
      // water creates no waves. Splash amplitude is proportional to speed.
      if (m.active && m.px >= 0) {
        const dxN = m.x - m.px;
        const dyN = m.y - m.py;
        const speed = Math.sqrt(dxN * dxN + dyN * dyN);
        if (speed > 0.0005) {
          const steps = Math.max(
            1,
            Math.ceil(speed * Math.max(cols, rows) * 0.6),
          );
          for (let s = 0; s < steps; s++) {
            const f = s / steps;
            const sx = (m.px + dxN * f) * cols;
            const sy = (m.py + dyN * f) * rows;
            drop(sx, sy, Math.min(2.5, speed * 25), 1.8);
          }
        }
      }
      m.px = m.x;
      m.py = m.y;

      // 2. Wave step — generalized 2D wave equation:
      //   u(t+1) = (2 - 4k)·u(t) - u(t-1) + k·(N + S + E + W)
      // K is c² — the propagation coefficient. The standard Hugo-Elias form
      // uses K = 0.5 (waves travel at the grid's CFL limit). Lower K → slower
      // wave speed → the surface feels more viscous. Slightly stronger global
      // damping adds the "resistance" feel without killing amplitude too fast.
      // Fixed-zero boundary cells reflect with inverted phase; extra damping
      // in a narrow ring near each edge softens those reflections.
      const damp = 0.984;
      const K = 0.38;
      const SELF = 2 - 4 * K;
      const BORDER = 6;
      const EDGE_DAMP = 0.94;
      for (let y = 1; y < rows - 1; y++) {
        const rowOff = y * cols;
        const dyEdge = Math.min(y, rows - 1 - y);
        for (let x = 1; x < cols - 1; x++) {
          const i = rowOff + x;
          const sum =
            curr[i - 1]! + curr[i + 1]! + curr[i - cols]! + curr[i + cols]!;
          let v = (SELF * curr[i]! + K * sum - prev[i]!) * damp;
          const d = Math.min(x, cols - 1 - x, dyEdge);
          if (d < BORDER) {
            v *= EDGE_DAMP + (1 - EDGE_DAMP) * (d / BORDER);
          }
          nextBuf[i] = v;
        }
      }
      // Rotate buffers: oldest gets reused as the next scratch space.
      const tmp = prev;
      prev = curr;
      curr = nextBuf;
      nextBuf = tmp;

      // 3. Render — sample animated noise with displacement derived from the
      // ripple field's gradient, then add the ripple's own amplitude so the
      // crests/troughs are visible directly.
      const CMAX = CHARS.length - 1;
      const DISPLACE = 5.0;
      const RIPPLE_GAIN = 0.9;
      // How hard a ripple drives a character up the opacity stack. Higher =
      // fainter waves still flash bright; lower = only strong waves brighten.
      const RIPPLE_BRIGHT = 1.6;
      const LMAX = NLAYERS - 1;
      // One line buffer per opacity layer; a char lands in exactly one layer
      // and the rest get a space at that cell, so opacities never composite.
      const layerLines: string[][] = new Array(NLAYERS);
      for (let L = 0; L < NLAYERS; L++) layerLines[L] = new Array(rows);
      const rowArrs: string[][] = new Array(NLAYERS);
      for (let y = 0; y < rows; y++) {
        for (let L = 0; L < NLAYERS; L++) rowArrs[L] = new Array(cols);
        const rowOff = y * cols;
        for (let x = 0; x < cols; x++) {
          const i = rowOff + x;

          // Central-difference gradient (zero at edges — fine for displacement).
          let gx = 0;
          let gy = 0;
          if (x > 0 && x < cols - 1) gx = curr[i + 1]! - curr[i - 1]!;
          if (y > 0 && y < rows - 1) gy = curr[i + cols]! - curr[i - cols]!;

          // Pixel-space coords keep the noise visually isotropic regardless
          // of grid aspect ratio. Multiplied by base frequency = "blob size".
          // Smaller FREQ = zoomed in further = larger, smoother shapes.
          const FREQ = 0.011;
          const u = (x + gx * DISPLACE) * FREQ;
          const v = (y + gy * DISPLACE) * FREQ * 2.2;

          // Domain-warped FBM: gentle, always-on flow.
          const qx = fbm(u + t * 0.1, v) - 0.5;
          const qy = fbm(u + 5.2, v + t * 0.1) - 0.5;
          let n = fbm(u + qx * 1.4, v + qy * 1.4);

          // The ripple's own height adds visible amplitude.
          n += curr[i]! * RIPPLE_GAIN;

          // Contrast: shift+stretch into [0,1]. A gentler floor keeps mid-
          // density chars visible everywhere, removing the empty band.
          n = (n - 0.3) * 1.7;
          if (n < 0) n = 0;
          else if (n > 1) n = 1;

          const ch = CHARS[(n * CMAX) | 0]!;

          // Ripple magnitude (either crest or trough) picks the brightness
          // layer. Calm water → layer 0 (20%); a fresh splash → top layer.
          let b = Math.abs(curr[i]!) * RIPPLE_BRIGHT;
          if (b > 1) b = 1;
          const layer = ((b * LMAX + 0.5) | 0);
          for (let L = 0; L < NLAYERS; L++) {
            rowArrs[L]![x] = L === layer ? ch : " ";
          }
        }
        for (let L = 0; L < NLAYERS; L++) {
          layerLines[L]![y] = rowArrs[L]!.join("");
        }
      }
      for (let L = 0; L < NLAYERS; L++) {
        const p = pres[L];
        if (p) p.textContent = layerLines[L]!.join("\n");
      }

      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        `relative font-mono text-[10px] leading-2.5 tracking-tight select-none overflow-hidden`,
        className,
      )}
    >
      {LAYER_OPACITY.map((o, idx) => (
        <pre
          key={idx}
          ref={(node) => {
            preRefs.current[idx] = node;
          }}
          className="absolute inset-0 m-0 whitespace-pre text-white font-mono text-[10px] leading-2.5 tracking-tight"
          style={{ opacity: o }}
        />
      ))}
    </div>
  );
}
