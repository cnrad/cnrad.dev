import { useEffect, useRef } from "react";

// Point sprite vertex/fragment shaders. Particles are rendered as GL_POINTS,
// with per-particle position/size/alpha streamed from CPU. The fragment shader
// gives each point a soft glowing disc by combining a bright core with a wider
// low-intensity halo.
const VERTEX_SHADER = `
attribute vec2 aPosition;
attribute float aSize;
attribute float aAlpha;
uniform vec2 uResolution;
varying float vAlpha;
void main() {
  vec2 clip = (aPosition / uResolution) * 2.0 - 1.0;
  clip.y *= -1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = aSize;
  vAlpha = aAlpha;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float vAlpha;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d) * 2.0;
  if (r > 1.0) discard;
  // Flat-topped disc with a narrow anti-aliased edge — gives each particle
  // hard, well-defined coverage instead of a soft glow that accumulates into
  // a fuzzy boundary when neighbours overlap.
  float a = (1.0 - smoothstep(0.55, 0.95, r)) * vAlpha;
  gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}
`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type Particle = {
  // resting position (where the particle "belongs" on the signature path)
  tx: number;
  ty: number;
  // current state
  x: number;
  y: number;
  vx: number;
  vy: number;
  // intro delay (seconds before this particle starts flying in)
  delay: number;
  // sprite size in canvas pixels
  size: number;
  // baseline alpha lifted from the source pixel — keeps the stroke's
  // anti-aliased edges intact at rest
  baseAlpha: number;
  // phase offsets for idle drift so neighbouring particles don't move in lockstep
  phaseX: number;
  phaseY: number;
};

export function SignatureReveal({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: true,
      antialias: true,
    });
    if (!gl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function compile(type: number, source: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      return s;
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, "aPosition");
    const aSize = gl.getAttribLocation(program, "aSize");
    const aAlpha = gl.getAttribLocation(program, "aAlpha");
    const uRes = gl.getUniformLocation(program, "uResolution");

    const posBuf = gl.createBuffer()!;
    const sizeBuf = gl.createBuffer()!;
    const alphaBuf = gl.createBuffer()!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let particles: Particle[] = [];
    let positions = new Float32Array(0);
    let alphas = new Float32Array(0);
    let rafId: number | null = null;
    let rafScheduled = false;
    let cancelled = false;
    // Visibility is updated by an IntersectionObserver below. Defaults to
    // true so the loop kicks off naturally if the observer hasn't fired yet.
    let isVisible = true;
    // Render function isn't defined until the SVG is loaded and particles
    // are built. We hold onto it so the IntersectionObserver can resume the
    // loop when the signature scrolls back into view.
    let renderFn: (() => void) | null = null;
    // mouse position in canvas-pixel space (not CSS pixels)
    const mouse = { x: -1e6, y: -1e6, has: false };
    // Set to performance.now() on the first frame that actually runs (i.e.
    // the first frame the signature is visible). This way the intro plays
    // when the user first sees the signature, not when the image loaded.
    let startTime = 0;

    function ensureRunning() {
      if (cancelled || !isVisible || !renderFn || rafScheduled) return;
      rafScheduled = true;
      rafId = requestAnimationFrame(renderFn);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) isVisible = entry.isIntersecting;
        if (isVisible) ensureRunning();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    loadImage(src)
      .then((img) => {
        if (cancelled) return;

        // Sample at 2x source resolution so the stroke is dense enough to
        // sub-sample down to a few thousand evenly-spaced particles.
        const sampleScale = 2;
        const w = Math.round(img.naturalWidth * sampleScale);
        const h = Math.round(img.naturalHeight * sampleScale);

        // Padding (in canvas pixels) around the signature so cursor-pushed
        // particles aren't clipped at the canvas edge. The CSS-side
        // compensation lives on the canvas element below; the relationship
        // assumes the parent passes h-20 / -mx-6 with sampleScale = 2.
        const PAD = 60;
        const canvasW = w + 2 * PAD;
        const canvasH = h + 2 * PAD;

        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const offCtx = off.getContext("2d", { willReadFrequently: true });
        if (!offCtx) return;
        offCtx.drawImage(img, 0, 0, w, h);
        const data = offCtx.getImageData(0, 0, w, h).data;

        // Sample every opaque pixel so the resting signature reads as a
        // solid stroke, not a dotted outline. Edge pixels carry their source
        // alpha forward so the stroke keeps its anti-aliased boundary.
        const targets: { x: number; y: number; a: number }[] = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const a = data[(y * w + x) * 4 + 3] ?? 0;
            if (a > 64) {
              targets.push({ x: x + 0.5, y: y + 0.5, a: a / 255 });
            }
          }
        }

        canvas.width = canvasW;
        canvas.height = canvasH;
        gl!.viewport(0, 0, canvasW, canvasH);
        gl!.uniform2f(uRes, canvasW, canvasH);

        // Signature sits in the middle of the padded canvas.
        const cx = canvasW / 2;
        const cy = canvasH / 2;

        particles = targets.map((t) => {
          // Target positions are offset by PAD so the signature is centered
          // in the padded canvas, leaving room on every side.
          const tx = t.x + PAD;
          const ty = t.y + PAD;
          // Each particle spawns at a random angle far outside the canvas.
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.max(canvasW, canvasH) * (0.55 + Math.random() * 0.6);
          // Reading-order stagger: left edge starts first, right edge last,
          // with a touch of randomness so the boundary isn't a hard line.
          const delay = reduced
            ? 0
            : (t.x / w) * 0.55 + Math.random() * 0.28;
          return {
            tx,
            ty,
            x: reduced ? tx : cx + Math.cos(angle) * dist,
            y: reduced ? ty : cy + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            delay,
            // Larger sprites with a tight size range so the stroke reads as a
            // single uniform fill rather than a texture of varied dots.
            size: 3.0 + Math.random() * 0.6,
            baseAlpha: t.a,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
          };
        });

        const N = particles.length;
        positions = new Float32Array(N * 2);
        alphas = new Float32Array(N);
        const sizesArr = new Float32Array(N);
        for (let i = 0; i < N; i++) sizesArr[i] = particles[i]!.size;

        gl!.bindBuffer(gl!.ARRAY_BUFFER, sizeBuf);
        gl!.bufferData(gl!.ARRAY_BUFFER, sizesArr, gl!.STATIC_DRAW);
        gl!.enableVertexAttribArray(aSize);
        gl!.vertexAttribPointer(aSize, 1, gl!.FLOAT, false, 0, 0);

        gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuf);
        gl!.bufferData(gl!.ARRAY_BUFFER, positions, gl!.DYNAMIC_DRAW);
        gl!.enableVertexAttribArray(aPos);
        gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);

        gl!.bindBuffer(gl!.ARRAY_BUFFER, alphaBuf);
        gl!.bufferData(gl!.ARRAY_BUFFER, alphas, gl!.DYNAMIC_DRAW);
        gl!.enableVertexAttribArray(aAlpha);
        gl!.vertexAttribPointer(aAlpha, 1, gl!.FLOAT, false, 0, 0);

        // Tuning knobs ---------------------------------------------------
        const k = 0.012; // spring stiffness toward resting position
        const damp = 0.85; // velocity damping per frame
        const mr = 130; // cursor radius (canvas px)
        const mForce = 5.5; // cursor repulsion strength
        const driftAmp = 0.12; // idle drift amplitude (canvas px)
        const fadeDur = 0.55; // fade-in duration after delay (s)
        // ----------------------------------------------------------------

        function render() {
          rafScheduled = false;
          if (cancelled || !isVisible) return;
          if (startTime === 0) startTime = performance.now();
          const elapsed = (performance.now() - startTime) / 1000;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i]!;
            const t = elapsed - p.delay;

            if (t < 0) {
              // Park hidden particles off-screen so they're never drawn
              // visibly even if alpha rounding hiccups.
              positions[i * 2] = -1e6;
              positions[i * 2 + 1] = -1e6;
              alphas[i] = 0;
              continue;
            }

            // Position-coherent drift: nearby particles share a phase derived
            // from their rest position, so the stroke breathes as a whole
            // rather than each pixel flickering independently.
            const driftX =
              Math.sin(elapsed * 0.5 + p.tx * 0.006 + p.phaseX * 0.15) *
              driftAmp;
            const driftY =
              Math.cos(elapsed * 0.42 + p.ty * 0.01 + p.phaseY * 0.15) *
              driftAmp;
            const tgtX = p.tx + driftX;
            const tgtY = p.ty + driftY;

            let ax = (tgtX - p.x) * k;
            let ay = (tgtY - p.y) * k;

            if (!reduced && mouse.has) {
              const dx = p.x - mouse.x;
              const dy = p.y - mouse.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < mr * mr && d2 > 0.5) {
                const d = Math.sqrt(d2);
                // Quadratic falloff: strong push at the center, none at edge.
                const falloff = 1 - d / mr;
                const force = falloff * falloff * mForce;
                ax += (dx / d) * force;
                ay += (dy / d) * force;
              }
            }

            p.vx = (p.vx + ax) * damp;
            p.vy = (p.vy + ay) * damp;
            p.x += p.vx;
            p.y += p.vy;

            positions[i * 2] = p.x;
            positions[i * 2 + 1] = p.y;
            alphas[i] = Math.min(1, t / fadeDur) * p.baseAlpha;
          }

          gl!.clearColor(0, 0, 0, 0);
          gl!.clear(gl!.COLOR_BUFFER_BIT);

          gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuf);
          gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, positions);

          gl!.bindBuffer(gl!.ARRAY_BUFFER, alphaBuf);
          gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, alphas);

          gl!.drawArrays(gl!.POINTS, 0, particles.length);
          rafScheduled = true;
          rafId = requestAnimationFrame(render);
        }
        renderFn = render;
        ensureRunning();
      })
      .catch(() => {
        // Image failed to load — canvas stays blank.
      });

    const setMouseFrom = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Convert CSS-pixel coords to canvas-pixel coords.
      mouse.x = (clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (clientY - rect.top) * (canvas.height / rect.height);
      mouse.has = true;
    };

    const onMouseMove = (e: MouseEvent) => setMouseFrom(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setMouseFrom(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      mouse.has = false;
    };
    const onMouseLeaveDoc = () => {
      mouse.has = false;
    };
    const hideOnUnload = () => {
      canvas.style.visibility = "hidden";
    };

    // Mouse moves are still tracked window-wide so the cursor can influence
    // particles before it's directly over the canvas. Touches, by contrast,
    // are scoped to the canvas itself — combined with touch-action: pan-y
    // below, this lets the page scroll normally while horizontal swipes
    // across the signature scatter the particles.
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc);
    window.addEventListener("beforeunload", hideOnUnload);

    return () => {
      cancelled = true;
      io.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      window.removeEventListener("beforeunload", hideOnUnload);

      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(sizeBuf);
      gl.deleteBuffer(alphaBuf);
      gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <a
      href="https://signature.cnrad.dev"
      target="_blank"
      rel="noopener noreferrer"
    >
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          imageRendering: "auto",
          // touch-action: pan-y lets vertical scroll pass through to the page
          // while horizontal swipes are claimed by our touchmove listener,
          // so a thumb starting on the signature can still scroll the page.
          touchAction: "pan-y",
          // Expand the canvas 12 CSS px on every side to give cursor-pushed
          // particles room to scatter past the signature without clipping,
          // then pull it back into its original layout slot with negative
          // margins on all four sides. The +12/-12 maths assumes the parent
          // passes h-20 + -mx-6; the +60 canvas-pixel PAD inside the effect
          // is the matching offset in drawing-buffer space.
          height: "calc(5rem + 24px)",
          marginTop: "-12px",
          marginBottom: "-12px",
          marginLeft: "calc(-1.5rem - 12px)",
          marginRight: "calc(-1.5rem - 12px)",
        }}
      />
    </a>
  );
}
