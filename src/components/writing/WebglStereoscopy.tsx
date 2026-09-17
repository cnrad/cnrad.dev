import { useEffect, useRef } from "react";
import { WritingCanvas } from "./WritingCanvas";

// A stereoscopic WebGL footer: a raymarched ocean at sunset rendered twice, side
// by side, from two camera positions an eye-separation apart — cross your eyes to
// fuse the pair and the swell, the horizon and the glitter path gain real depth.
// The sun's elevation is driven by scroll (scroll down to set it), and the render
// loop only runs while the canvas is in the viewport (IntersectionObserver),
// pausing on a hidden tab — so it costs nothing when you're not looking at it.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSep;   // eye separation (world units)
uniform float uConv;  // convergence (image shift for comfortable fusion)
uniform float uDots;  // alignment guide dots
uniform vec3 uSun;    // sun direction (elevation driven by scroll)

// Height field — a stack of directional swells; this carries the real depth.
float waves(vec2 p, float t) {
  float h = 0.0;
  h += sin(p.x * 0.50 + t * 0.70) * 0.55;
  h += sin(p.y * 0.60 - t * 0.55) * 0.50;
  h += sin((p.x * 0.42 + p.y * 0.40) + t * 0.90) * 0.40;
  h += sin((p.x * 1.20 - p.y * 0.85) - t * 1.20) * 0.20;
  h += sin((p.x * 0.85 + p.y * 1.35) + t * 1.50) * 0.15;
  h += sin(p.x * 2.20 + p.y * 1.80 + t * 2.00) * 0.08;
  h += sin(p.x * 3.40 - p.y * 3.10 - t * 2.60) * 0.05;
  return h;
}
float surf(vec2 xz, float t) { return waves(xz, t); }

vec3 nrm(vec2 xz, float t) {
  vec2 e = vec2(0.06, 0.0);
  float l = surf(xz - e.xy, t), r = surf(xz + e.xy, t);
  float d = surf(xz - e.yx, t), u = surf(xz + e.yx, t);
  return normalize(vec3(l - r, 2.0 * e.x, d - u));
}

// Sky / backdrop — warms toward orange as the sun drops to the horizon, and
// dims into dusk once it sets. All the colour comes from the sun and its glow.
vec3 sky(vec3 rd) {
  float y = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
  float low = smoothstep(0.42, 0.0, uSun.y);    // 1 as the sun nears the horizon
  float dusk = smoothstep(0.02, -0.12, uSun.y); // 1 once it's below the horizon
  vec3 horizon = mix(vec3(0.30, 0.42, 0.62), vec3(1.10, 0.50, 0.22), low);
  vec3 zenith = mix(vec3(0.05, 0.12, 0.30), vec3(0.16, 0.10, 0.26), low);
  vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.85, y));
  col *= mix(1.0, 0.26, dusk);                  // fade into night
  float s = max(dot(rd, uSun), 0.0);
  vec3 sunCol = mix(vec3(1.0, 0.92, 0.72), vec3(1.0, 0.5, 0.24), low);
  col += sunCol * pow(s, 600.0) * 3.0 * (1.0 - dusk * 0.7);   // disk
  col += vec3(1.0, 0.55, 0.30) * pow(s, 8.0) * (0.22 + low * 0.5);
  col += vec3(1.0, 0.5, 0.28) * pow(s, 2.0) * 0.14 * low;     // broad horizon glow
  return col;
}

vec3 shadeWater(vec3 p, vec3 n, vec3 rd) {
  vec3 refl = reflect(rd, n);
  vec3 reflCol = sky(refl);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
  fres = mix(0.03, 1.0, fres);                  // grazing angles mirror the sky
  float facing = clamp(n.y, 0.0, 1.0);
  float low = smoothstep(0.42, 0.0, uSun.y);
  vec3 deep = vec3(0.012, 0.045, 0.09);
  vec3 shallow = vec3(0.04, 0.16, 0.24);
  vec3 body = mix(deep, shallow, facing);
  body += vec3(0.18, 0.07, 0.02) * low * 0.5;   // warm the water under a low sun
  vec3 col = mix(body, reflCol, fres);
  float spec = pow(max(dot(refl, uSun), 0.0), 220.0);
  vec3 specCol = mix(vec3(1.0, 0.92, 0.72), vec3(1.0, 0.55, 0.30), low);
  col += specCol * spec * 2.2;                   // glitter path toward the sun
  float crest = smoothstep(0.22, 0.6, p.y);
  col += vec3(0.6, 0.35, 0.2) * crest * 0.2 * low;
  return col;
}

vec3 render(vec3 ro, vec3 rd, float t) {
  float tt = 0.0, prevT = 0.0;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    vec3 pos = ro + rd * tt;
    if (pos.y - surf(pos.xz, t) < 0.0) { hit = true; break; }
    prevT = tt;
    tt += 0.09 + tt * 0.03;
    if (tt > 65.0) break;
  }
  if (!hit) return sky(rd);
  float a = prevT, b = tt;
  for (int j = 0; j < 6; j++) {
    float m = 0.5 * (a + b);
    vec3 pm = ro + rd * m;
    if (pm.y - surf(pm.xz, t) < 0.0) b = m; else a = m;
  }
  float th = 0.5 * (a + b);
  vec3 p = ro + rd * th;
  vec3 col = shadeWater(p, nrm(p.xz, t), rd);
  return mix(col, sky(rd), 1.0 - exp(-th * 0.028)); // distance fog to the horizon
}

void main() {
  vec2 frag = gl_FragCoord.xy / uRes;
  float panel = frag.x < 0.5 ? 0.0 : 1.0;
  vec2 pv = vec2((frag.x - panel * 0.5) * 2.0, frag.y);
  float aspect = (uRes.x * 0.5) / uRes.y;
  vec2 uv = (pv - 0.5) * 2.0;
  uv.x *= aspect;

  // Cross-eye: the left panel is seen by the right eye (+separation).
  float eyeSign = panel < 0.5 ? 1.0 : -1.0;
  float t = uTime;

  vec3 camPos = vec3(0.0, 2.3, -5.5);
  vec3 fwd = normalize(vec3(0.0, 0.0, 8.0) - camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = cross(fwd, right);
  vec3 ro = camPos + right * (eyeSign * uSep * 0.5);

  float fov = 1.1;
  vec2 sc = uv;
  sc.x -= eyeSign * uConv;
  vec3 rd = normalize(fwd + sc.x * right * fov + sc.y * up * fov);

  vec3 col = render(ro, rd, t);

  if (uDots > 0.5) {
    float d = distance(pv, vec2(0.5, 0.9));
    col = mix(col, vec3(0.9, 0.96, 1.0), smoothstep(0.011, 0.006, d) * 0.85);
  }
  if (abs(frag.x - 0.5) < 0.0016) col = vec3(0.02, 0.02, 0.03);
  col *= clamp(1.0 - dot(uv * 0.5, uv * 0.5) * 0.08, 0.0, 1.0); // vignette

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (import.meta.env.DEV && !gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("WebglStereoscopy shader compile:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

export function WebglStereoscopy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (import.meta.env.DEV && !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("WebglStereoscopy link:", gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    // Fullscreen triangle.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uSun = gl.getUniformLocation(prog, "uSun");
    gl.uniform1f(gl.getUniformLocation(prog, "uSep"), 0.5);
    gl.uniform1f(gl.getUniformLocation(prog, "uConv"), 0.08);
    gl.uniform1f(gl.getUniformLocation(prog, "uDots"), 1.0);

    // Sun elevation from scroll: as the canvas travels UP the viewport (scrolling
    // down toward it), the sun descends from high to just below the horizon.
    // Azimuth is fixed ahead-and-left so the sun sits in frame.
    const AZ = { x: -0.42, z: 0.91 };
    const azLen = Math.hypot(AZ.x, AZ.z);
    const updateSun = () => {
      const rect = canvas.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centerFrac = (rect.top + rect.height * 0.5) / vh; // ~1 at bottom, ~0 at top
      const prog01 = Math.max(0, Math.min(1, 1 - centerFrac));
      const elev = 0.42 + prog01 * -0.52; // 0.42 (high) → ~0.16 centered (sunset) → -0.10 (set)
      const ce = Math.cos(elev);
      gl.uniform3f(uSun, (AZ.x / azLen) * ce, Math.sin(elev), (AZ.z / azLen) * ce);
    };
    updateSun();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Render loop, gated on visibility so it costs nothing off-screen.
    let raf = 0;
    let clock = 0;
    let last = 0;
    let running = false;
    const frame = (now: number) => {
      if (!running) return;
      if (!last) last = now;
      clock += Math.min(0.05, (now - last) / 1000);
      last = now;
      resize();
      updateSun();
      gl.uniform1f(uTime, clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e?.isIntersecting ?? false;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // NOTE: do NOT loseContext() here. Under StrictMode the effect runs
      // mount → cleanup → mount, and getContext() returns the SAME context for
      // a canvas — force-losing it on the first cleanup leaves the second mount
      // with a dead (lost) context and a "crashed" canvas. Let GC handle it.
    };
  }, []);

  return (
    <WritingCanvas>
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-default select-none"
          style={{ aspectRatio: "22 / 10" }}
          aria-label="A stereoscopic ocean at sunset — cross your eyes to fuse the two panels into 3D. Scroll to move the sun."
        />
      </div>
    </WritingCanvas>
  );
}
