import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, animate } from "motion/react";

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTime;

  // simplex-ish hash noise
  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec4 tex = texture2D(uTexture, vUv);

    // sweep from left to right: x position + noise distortion
    float grain = fbm(vUv * 12.0 + uTime * 0.5);
    float sweep = vUv.x * 0.6 + grain * 0.4;

    // progress reveals: 0 = hidden, 1 = fully visible
    float threshold = uProgress * 1.4 - 0.2;
    float edge = smoothstep(threshold - 0.05, threshold + 0.15, sweep);
    edge = 1.0 - edge;

    // dust particles at the reveal edge
    float dust = step(0.65, hash(vUv * 200.0 + uTime));
    float edgeDust = smoothstep(threshold - 0.1, threshold + 0.05, sweep)
                   * (1.0 - smoothstep(threshold + 0.05, threshold + 0.25, sweep));
    float dustAlpha = edgeDust * dust * 0.8;

    float alpha = tex.a * clamp(edge + dustAlpha, 0.0, 1.0);
    vec3 color = tex.rgb;

    gl_FragColor = vec4(color, alpha);
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

export function SignatureReveal({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressValue = useMotionValue(0);
  const progress = useSpring(progressValue, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) return;

    // compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // uniforms
    const uProgress = gl.getUniformLocation(program, "uProgress");
    const uTime = gl.getUniformLocation(program, "uTime");

    // texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let animId: number;
    let startTime = performance.now();

    loadImage(src).then((img) => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      startTime = performance.now();

      function render() {
        const t = (performance.now() - startTime) / 1000;
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        gl!.uniform1f(uProgress, progress.get());
        gl!.uniform1f(uTime, t);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
        animId = requestAnimationFrame(render);
      }
      render();

      // trigger the reveal
      animate(progressValue, 1, {
        duration: 3.5,
        ease: [0.22, 0.9, 0.4, 1],
        delay: 0.3,
      });
    });

    const hideOnUnload = () => {
      if (canvas) canvas.style.visibility = "hidden";
    };
    window.addEventListener("beforeunload", hideOnUnload);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("beforeunload", hideOnUnload);
    };
  }, [src, progress, progressValue]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "auto" }}
    />
  );
}
