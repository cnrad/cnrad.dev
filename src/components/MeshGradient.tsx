import { useEffect, useRef } from "react";

// --- Shared vertex shader ---
const quadVert = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// --- Advect + decay the velocity field ---
const advectFrag = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;
  uniform float uDissipation;

  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    // Trace back along velocity and sample
    vec2 prevUv = vUv - vel * uTexelSize * 1.0;
    vec2 advected = texture2D(uVelocity, prevUv).xy;
    gl_FragColor = vec4(advected * uDissipation, 0.0, 1.0);
  }
`;

// --- Splat mouse force into velocity field ---
const splatFrag = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec2 uPoint;
  uniform vec2 uForce;
  uniform float uRadius;

  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 d = vUv - uPoint;
    float falloff = exp(-dot(d, d) / (uRadius * uRadius));
    vel += uForce * falloff;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

// --- Main display shader ---
const displayFrag = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uVelocity;
  uniform sampler2D uSignature;
  uniform float uHasSignature;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec3 iridescence(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }

  float dither4x4(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));
    int idx = x + y * 4;
    float m;
    if (idx == 0) m = 0.0; else if (idx == 1) m = 8.0;
    else if (idx == 2) m = 2.0; else if (idx == 3) m = 10.0;
    else if (idx == 4) m = 12.0; else if (idx == 5) m = 4.0;
    else if (idx == 6) m = 14.0; else if (idx == 7) m = 6.0;
    else if (idx == 8) m = 3.0; else if (idx == 9) m = 11.0;
    else if (idx == 10) m = 1.0; else if (idx == 11) m = 9.0;
    else if (idx == 12) m = 15.0; else if (idx == 13) m = 7.0;
    else if (idx == 14) m = 13.0; else m = 5.0;
    return m / 16.0;
  }

  void main() {
    float t = uTime * 0.1;
    float pixelSize = 3.0;
    vec2 snappedFragCoord = floor(gl_FragCoord.xy / pixelSize) * pixelSize;
    vec2 baseUv = snappedFragCoord / uResolution;

    // Sample fluid velocity field and use it to distort UVs
    vec2 vel = texture2D(uVelocity, baseUv).xy;
    vec2 uv = baseUv + vel * 0.15;

    float n1 = snoise(uv * 0.2 + vec2(t * 0.7, t * 0.5));
    float n2 = snoise(uv * 0.35 + vec2(-t * 0.4, t * 0.8));
    float n3 = snoise(uv * 0.5 + vec2(t * 0.6, -t * 0.3));
    float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    float eps = 0.01;
    float nx = snoise(uv * 0.25 + vec2(t * 0.5 + eps, t * 0.3)) -
               snoise(uv * 0.25 + vec2(t * 0.5 - eps, t * 0.3));
    float ny = snoise(uv * 0.25 + vec2(t * 0.5, t * 0.3 + eps)) -
               snoise(uv * 0.25 + vec2(t * 0.5, t * 0.3 - eps));
    vec3 normal = normalize(vec3(nx * 4.0, ny * 4.0, 1.0));

    vec3 lightDir = normalize(vec3(
      0.5 + 0.3 * sin(t * 0.8),
      0.6 + 0.2 * cos(t * 0.6),
      0.8
    ));
    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfDir), 0.0), 24.0);

    float phase = combined * 2.0 + uv.x * 1.2 + t * 0.4;
    vec3 color = iridescence(phase);
    color = color * (0.5 + 0.6 * diffuse) + vec3(spec * 0.4);
    color *= 0.85;

    float shimmer = snoise(uv * 0.8 + t * 2.0) * 0.04;
    color += shimmer;

    // Signature overlay — centered, aspect-correct
    if (uHasSignature > 0.5) {
      // Scale UVs to center the signature with correct aspect ratio
      vec2 sigUv = baseUv;
      float canvasAspect = uResolution.x / uResolution.y;
      float sigAspect = 650.0 / 200.0; // signature SVG aspect ratio
      // Make the signature nearly full width
      float sigScale = 1.15;
      sigUv.x = (sigUv.x - 0.5) * sigScale + 0.5;
      sigUv.y = (sigUv.y - 0.5) * sigScale * (canvasAspect / sigAspect) + 0.5;
      // Flip Y for texture
      sigUv.y = 1.0 - sigUv.y;

      if (sigUv.x >= 0.0 && sigUv.x <= 1.0 && sigUv.y >= 0.0 && sigUv.y <= 1.0) {
        float sigAlpha = texture2D(uSignature, sigUv).a;
        // Darken where signature is present
        color = mix(color, vec3(0.0), sigAlpha);
      }
    }

    vec2 pixelCoord = floor(gl_FragCoord.xy / pixelSize);
    float threshold = dither4x4(pixelCoord);
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    float dithered = step(threshold, luminance);
    color = mix(color * 0.15, color * 1.4, dithered);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  return prog;
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return { tex, fbo };
}

export function MeshGradient({ className, signature }: { className?: string; signature?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Need float textures for the velocity field
    const ext = gl.getExtension("OES_texture_float");
    if (!ext) return;
    gl.getExtension("OES_texture_float_linear");

    // Quad geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog: WebGLProgram) {
      const loc = gl!.getAttribLocation(prog, "position");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    // Programs
    const advectProg = createProgram(gl, quadVert, advectFrag);
    const splatProg = createProgram(gl, quadVert, splatFrag);
    const displayProg = createProgram(gl, quadVert, displayFrag);

    // Load signature texture if provided
    let sigTexture: WebGLTexture | null = null;
    let sigLoaded = false;
    if (signature) {
      sigTexture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, sigTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        gl!.bindTexture(gl!.TEXTURE_2D, sigTexture);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        sigLoaded = true;
      };
      img.src = signature;
    }

    // Simulation resolution (lower than display for performance)
    const simW = 128;
    const simH = 64;

    let velA = createFBO(gl, simW, simH);
    let velB = createFBO(gl, simW, simH);

    // Mouse state
    let mouseX = -1, mouseY = -1;
    let prevMouseX = -1, prevMouseY = -1;
    let hasMoved = false;

    function updatePointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1.0 - (clientY - rect.top) / rect.height;
      if (prevMouseX < 0) { prevMouseX = x; prevMouseY = y; }
      else { prevMouseX = mouseX; prevMouseY = mouseY; }
      mouseX = x;
      mouseY = y;
      hasMoved = true;
    }

    const onMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);

    const onMouseLeave = () => {
      hasMoved = false;
      prevMouseX = -1;
      prevMouseY = -1;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        prevMouseX = -1;
        prevMouseY = -1;
        updatePointer(touch.clientX, touch.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      hasMoved = false;
      prevMouseX = -1;
      prevMouseY = -1;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    // Display sizing
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let animId: number;
    const startTime = performance.now();

    function render() {
      const t = (performance.now() - startTime) / 1000;

      // --- Splat mouse force ---
      if (hasMoved && prevMouseX >= 0) {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 0.0001) {
          gl!.viewport(0, 0, simW, simH);
          gl!.useProgram(splatProg);
          bindQuad(splatProg);

          gl!.activeTexture(gl!.TEXTURE0);
          gl!.bindTexture(gl!.TEXTURE_2D, velA.tex);
          gl!.uniform1i(gl!.getUniformLocation(splatProg, "uVelocity"), 0);
          gl!.uniform2f(gl!.getUniformLocation(splatProg, "uPoint"), mouseX, mouseY);
          gl!.uniform2f(gl!.getUniformLocation(splatProg, "uForce"), dx * 10.0, dy * 10.0);
          gl!.uniform1f(gl!.getUniformLocation(splatProg, "uRadius"), 0.06);

          gl!.bindFramebuffer(gl!.FRAMEBUFFER, velB.fbo);
          gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
          [velA, velB] = [velB, velA];
        }
      }

      // --- Advect velocity field ---
      gl!.viewport(0, 0, simW, simH);
      gl!.useProgram(advectProg);
      bindQuad(advectProg);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velA.tex);
      gl!.uniform1i(gl!.getUniformLocation(advectProg, "uVelocity"), 0);
      gl!.uniform2f(gl!.getUniformLocation(advectProg, "uTexelSize"), 1.0 / simW, 1.0 / simH);
      gl!.uniform1f(gl!.getUniformLocation(advectProg, "uDissipation"), 0.985);

      gl!.bindFramebuffer(gl!.FRAMEBUFFER, velB.fbo);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      [velA, velB] = [velB, velA];

      // --- Display ---
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.useProgram(displayProg);
      bindQuad(displayProg);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velA.tex);
      gl!.uniform1i(gl!.getUniformLocation(displayProg, "uVelocity"), 0);
      gl!.uniform1f(gl!.getUniformLocation(displayProg, "uTime"), t);
      gl!.uniform2f(gl!.getUniformLocation(displayProg, "uResolution"), canvas.width, canvas.height);

      // Signature texture on unit 1
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, sigTexture);
      gl!.uniform1i(gl!.getUniformLocation(displayProg, "uSignature"), 1);
      gl!.uniform1f(gl!.getUniformLocation(displayProg, "uHasSignature"), sigLoaded ? 1.0 : 0.0);

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      hasMoved = false;
      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return <canvas ref={canvasRef} className={`touch-none ${className ?? ""}`} />;
}
