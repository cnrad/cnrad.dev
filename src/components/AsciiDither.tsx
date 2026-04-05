import { useEffect, useRef } from "react";

// Perlin noise
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = p[i]!;
    p[i] = p[j]!;
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!;

  const grad: [number, number][] = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];

  function dot(gi: number, x: number, y: number) {
    const g = grad[gi % 8]!;
    return g[0] * x + g[1] * y;
  }

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
  }

  return function noise(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = perm[perm[xi]! + yi]!;
    const ab = perm[perm[xi]! + yi + 1]!;
    const ba = perm[perm[xi + 1]! + yi]!;
    const bb = perm[perm[xi + 1]! + yi + 1]!;

    return lerp(
      lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u),
      lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

const CHARS = " .,:;+*?%#@";

export function AsciiDither({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = createNoise();

    const cellSize = 10;
    const fontSize = 12;

    // Velocity field at grid resolution — stores the disturbance from cursor movement
    let cols = 0;
    let rows = 0;
    let fieldX: Float32Array;
    let fieldY: Float32Array;

    // Mouse tracking
    let prevMouseX = -1;
    let prevMouseY = -1;
    let mouseX = -9999;
    let mouseY = -9999;

    const splatRadius = 60; // px radius of cursor influence
    const splatStrength = 15; // force multiplier
    const dissipation = 0.92; // how fast the field decays per frame
    const diffusion = 0.15; // how much force spreads to neighbors

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);

      cols = Math.ceil(rect.width / cellSize);
      rows = Math.ceil(rect.height / cellSize);
      fieldX = new Float32Array(cols * rows);
      fieldY = new Float32Array(cols * rows);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function splatForce(px: number, py: number, vx: number, vy: number) {
      // Convert pixel coords to grid coords
      const gcx = px / cellSize;
      const gcy = py / cellSize;
      const gr = splatRadius / cellSize;

      const minC = Math.max(0, Math.floor(gcx - gr));
      const maxC = Math.min(cols - 1, Math.ceil(gcx + gr));
      const minR = Math.max(0, Math.floor(gcy - gr));
      const maxR = Math.min(rows - 1, Math.ceil(gcy + gr));

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const dx = c - gcx;
          const dy = r - gcy;
          const d2 = dx * dx + dy * dy;
          const r2 = gr * gr;
          if (d2 > r2) continue;

          const falloff = Math.exp(-d2 / (r2 * 0.25));
          const idx = r * cols + c;
          fieldX[idx] = (fieldX[idx] ?? 0) + vx * falloff * splatStrength;
          fieldY[idx] = (fieldY[idx] ?? 0) + vy * falloff * splatStrength;
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      if (prevMouseX > -1) {
        const vx = mouseX - prevMouseX;
        const vy = mouseY - prevMouseY;
        splatForce(mouseX, mouseY, vx, vy);
      }
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }

    function onMouseLeave() {
      prevMouseX = -1;
      prevMouseY = -1;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas!.getBoundingClientRect();
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;

      if (prevMouseX > -1) {
        const vx = mouseX - prevMouseX;
        const vy = mouseY - prevMouseY;
        splatForce(mouseX, mouseY, vx, vy);
      }
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }

    function onTouchEnd() {
      prevMouseX = -1;
      prevMouseY = -1;
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas!.getBoundingClientRect();
      prevMouseX = touch.clientX - rect.left;
      prevMouseY = touch.clientY - rect.top;
    }, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    let animId: number;
    const startTime = performance.now();

    function render() {
      const t = (performance.now() - startTime) / 1000;
      const rect = canvas!.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;

      // Diffuse: spread forces to neighbors
      const tmpX = new Float32Array(cols * rows);
      const tmpY = new Float32Array(cols * rows);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          let sx = fieldX[idx]!;
          let sy = fieldY[idx]!;
          let count = 1;

          if (c > 0) { sx += fieldX[idx - 1]! * diffusion; sy += fieldY[idx - 1]! * diffusion; count += diffusion; }
          if (c < cols - 1) { sx += fieldX[idx + 1]! * diffusion; sy += fieldY[idx + 1]! * diffusion; count += diffusion; }
          if (r > 0) { sx += fieldX[idx - cols]! * diffusion; sy += fieldY[idx - cols]! * diffusion; count += diffusion; }
          if (r < rows - 1) { sx += fieldX[idx + cols]! * diffusion; sy += fieldY[idx + cols]! * diffusion; count += diffusion; }

          tmpX[idx] = (sx / count) * dissipation;
          tmpY[idx] = (sy / count) * dissipation;
        }
      }

      fieldX.set(tmpX);
      fieldY.set(tmpY);

      // Render — transparent background (just clear, no fill)
      ctx!.clearRect(0, 0, canvasW, canvasH);

      ctx!.font = `${fontSize}px monospace`;
      ctx!.textBaseline = "middle";
      ctx!.textAlign = "center";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const baseX = col * cellSize + cellSize / 2;
          const baseY = row * cellSize + cellSize / 2;

          // Displace by field
          const fx = fieldX[idx]!;
          const fy = fieldY[idx]!;
          const drawX = baseX + fx;
          const drawY = baseY + fy;

          // Expanded bounds — allow drawing into the overflow area
          if (drawX < -cellSize || drawX > canvasW + cellSize || drawY < -cellSize || drawY > canvasH + cellSize) continue;

          // Flowing noise
          const nx = col * 0.06;
          const ny = row * 0.06;
          const n1 = noise(nx + t * 0.3, ny + t * 0.2);
          const n2 = noise(nx * 1.8 + t * -0.15 + 100, ny * 1.8 + t * 0.25 + 100);
          const n3 = noise(nx * 0.5 + t * 0.1 + 200, ny * 0.5 - t * 0.15 + 200);

          let val = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          val = val * 0.5 + 0.5;
          val = Math.max(0, Math.min(1, val));

          // Reduce density where field is strong (chars scatter away)
          const fieldMag = Math.sqrt(fx * fx + fy * fy);
          const scatter = Math.max(0, 1 - fieldMag * 0.08);
          val *= scatter;

          const charIdx = Math.floor(val * (CHARS.length - 1));
          const char = CHARS[charIdx] ?? " ";

          if (char === " ") continue;

          const brightness = Math.floor(80 + val * 175);
          ctx!.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
          ctx!.fillText(char, drawX, drawY);
        }
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`touch-none ${className ?? ""}`}
    />
  );
}
