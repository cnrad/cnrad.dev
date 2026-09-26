import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  BUTTONS,
  ERAS,
  N,
  clamp,
  glyphsAt,
  layout,
  smooth,
  styleAt,
  tFromCenter,
  thumbCenter,
  type ButtonKey,
  type ElState,
} from "../components/scrollbars/eras";
import {
  PAD,
  Scrollbar,
  type Region,
} from "../components/scrollbars/Scrollbar";

const V_LEN = 240; // vertical showcase length, native px
const BOX = 26; // cross-axis box, fits the widest era (Lisa, 24px)

const V_START = 0.2; // vertical showcase's initial scroll position
const V_LINE = 0.035; // one arrow click
const V_SPRING = { type: "spring", stiffness: 600, damping: 55 } as const;
type Bar = "h" | "v";

const SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 42,
  restDelta: 0.001,
} as const;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// This page stands apart from the rest of the site: white instead of the dark
// shell, its own title. Restored on the way out.
function useStandalonePage() {
  useEffect(() => {
    const html = document.documentElement;
    const theme = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    const prev = {
      bg: html.style.backgroundColor,
      title: document.title,
      theme: theme?.content,
    };
    html.style.backgroundColor = "#fff";
    document.title = "A History of Scrollbars";
    theme?.setAttribute("content", "#ffffff");
    return () => {
      html.style.backgroundColor = prev.bg;
      document.title = prev.title;
      if (prev.theme) theme?.setAttribute("content", prev.theme);
    };
  }, []);
}

function useViewport() {
  const [vp, setVp] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

export function Scrollbars() {
  useStandalonePage();
  const vp = useViewport();
  // Each native pixel maps to a whole number of device pixels, so 1-bit art stays crisp
  const dpr = window.devicePixelRatio || 1;
  const S =
    Math.max(1, Math.round((vp.h >= 800 && vp.w >= 720 ? 2 : 1.5) * dpr)) / dpr;
  const hLen = Math.min(900, vp.w - 40) / S - PAD * 2;

  const [initial] = useState(() =>
    clamp(Number(new URLSearchParams(location.search).get("t")) || 0, 0, N - 1),
  );
  const t = useMotionValue(initial);
  const [tv, setTv] = useState(initial);
  // Springs can overshoot the ends on a hard flick; nothing downstream should see that
  useMotionValueEvent(t, "change", (v) => setTv(clamp(v, 0, N - 1)));

  const anim = useRef<AnimationPlaybackControls | null>(null);
  const target = useRef(initial);

  const go = useCallback(
    (to: number, velocity?: number) => {
      const next = clamp(Math.round(to), 0, N - 1);
      target.current = next;
      anim.current?.stop();
      anim.current = animate(
        t,
        next,
        velocity === undefined ? SPRING : { ...SPRING, velocity },
      );
    },
    [t],
  );
  const step = useCallback((dir: number) => go(target.current + dir), [go]);

  const setDirect = useCallback(
    (v: number) => {
      anim.current?.stop();
      target.current = v;
      t.set(clamp(v, 0, N - 1));
    },
    [t],
  );

  const s = useMemo(() => styleAt(tv), [tv]);

  const vPos = useMotionValue(V_START);
  const [vpv, setVpv] = useState(V_START);
  useMotionValueEvent(vPos, "change", (v) => setVpv(clamp(v)));
  const vAnim = useRef<AnimationPlaybackControls | null>(null);
  const vTarget = useRef(V_START);
  const vGo = useCallback(
    (to: number) => {
      vTarget.current = clamp(to);
      vAnim.current?.stop();
      vAnim.current = animate(vPos, vTarget.current, V_SPRING);
    },
    [vPos],
  );

  // The horizontal scrubber drives history; the vertical showcase scrolls an
  // imaginary document of its own and never touches the timeline.
  const vg = layout(s, V_LEN);
  const vTravel = vg.track[1] - vg.track[0] - s.vThumb;
  const vCenterAt = (p: number) => vg.track[0] + s.vThumb / 2 + p * vTravel;
  const vc = vCenterAt(vpv);
  const hg = layout(s, hLen);
  const hc = clamp(
    thumbCenter(hLen, tv),
    hg.track[0] + s.hThumb / 2,
    hg.track[1] - s.hThumb / 2,
  );
  const labelPos = useMemo(
    () => ERAS.map((_, i) => thumbCenter(hLen, i)),
    [hLen],
  );
  const spacing = ((labelPos[N - 1]! - labelPos[0]!) / (N - 1)) * S;
  const compact = spacing < 42;

  const vRef = useRef<SVGSVGElement>(null);
  const hRef = useRef<SVGSVGElement>(null);
  const bars = {
    v: { g: vg, center: vc, thumb: s.vThumb, ref: vRef },
    h: { g: hg, center: hc, thumb: s.hThumb, ref: hRef },
  };

  // Pointer interaction
  const drag = useRef<{
    bar: Bar;
    grab: number;
    last: number;
    lastT: number;
    vel: number;
  } | null>(null);
  const repeat = useRef<number[]>([]);
  const [pressed, setPressed] = useState<{ bar: Bar; region: Region } | null>(
    null,
  );
  const [hover, setHover] = useState<{ bar: Bar; region: Region } | null>(null);

  const along = (bar: Bar, e: PointerEvent) => {
    const r = bars[bar].ref.current!.getBoundingClientRect();
    return (bar === "h" ? e.clientX - r.left : e.clientY - r.top) / S - PAD;
  };

  const hit = (bar: Bar, x: number): Region => {
    const { g, center, thumb } = bars[bar];
    if (Math.abs(x - center) <= thumb / 2) return "thumb";
    for (const k of BUTTONS) {
      const [a, b] = g[k];
      if (b - a > 0.5 && x >= a && x < b) return k;
    }
    return "track";
  };

  const clearRepeat = () => {
    repeat.current.forEach((id) => clearTimeout(id));
    repeat.current = [];
  };

  // Fire once now, then keep firing while held — like a real scroll arrow.
  const holdRepeat = (fn: () => boolean | void, every: number) => {
    if (fn() === false) return;
    const hold = window.setTimeout(() => {
      const id = window.setInterval(() => {
        if (fn() === false) clearRepeat();
      }, every);
      repeat.current.push(id);
    }, 380);
    repeat.current.push(hold);
  };

  const ARROW_DIR: Partial<Record<Region, number>> = {
    arrowTop: -1,
    extraTop: -1,
    upBot: -1,
    arrowBot: 1,
    extraBot: 1,
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const bar: Bar = e.currentTarget === vRef.current ? "v" : "h";
    const x = along(bar, e);
    const region = hit(bar, x);
    e.currentTarget.setPointerCapture(e.pointerId);
    setPressed({ bar, region });

    if (region === "thumb") {
      drag.current = {
        bar,
        grab: x - bars[bar].center,
        last: tv,
        lastT: e.timeStamp,
        vel: 0,
      };
      return;
    }

    if (bar === "v") {
      if (region === "track") {
        // Page toward the pointer until the thumb reaches it
        const dir = x < vc ? -1 : 1;
        const page = clamp(s.vThumb / Math.max(1, vTravel), 0.1, 0.5);
        holdRepeat(() => {
          const c = vCenterAt(vTarget.current);
          if (dir < 0 ? x >= c - s.vThumb / 2 : x <= c + s.vThumb / 2)
            return false;
          vGo(vTarget.current + dir * page);
        }, 90);
        return;
      }
      const dir = ARROW_DIR[region];
      if (dir) holdRepeat(() => vGo(vTarget.current + dir * V_LINE), 45);
      return;
    }

    if (region === "track") {
      go(tFromCenter(x, hLen));
      return;
    }
    const dir = ARROW_DIR[region];
    if (dir) holdRepeat(() => step(dir), 160);
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) {
      if (e.pointerType !== "mouse") return;
      const bar: Bar = e.currentTarget === vRef.current ? "v" : "h";
      const region = hit(bar, along(bar, e));
      if (hover?.bar !== bar || hover.region !== region)
        setHover({ bar, region });
      return;
    }
    if (d.bar === "v") {
      vAnim.current?.stop();
      vTarget.current = clamp(
        (along("v", e) - d.grab - vg.track[0] - s.vThumb / 2) /
          Math.max(1, vTravel),
      );
      vPos.set(vTarget.current);
      return;
    }
    const next = tFromCenter(along("h", e) - d.grab, hLen);
    const now = e.timeStamp;
    const dt = Math.max(1, now - d.lastT);
    d.vel = d.vel * 0.6 + ((next - d.last) / dt) * 1000 * 0.4;
    d.last = next;
    d.lastT = now;
    setDirect(next);
  };

  const onUp = (e: PointerEvent<SVGSVGElement>) => {
    clearRepeat();
    setPressed(null);
    const d = drag.current;
    drag.current = null;
    if (d?.bar === "h") {
      const vel = e.timeStamp - d.lastT > 80 ? 0 : d.vel;
      go(t.get() + vel * 0.12, vel);
    }
  };

  const current = Math.round(tv);
  const barProps = (bar: Bar) => ({
    ref: bars[bar].ref,
    role: "scrollbar",
    tabIndex: bar === "h" ? 0 : -1,
    className: "block touch-none outline-none",
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
    onLostPointerCapture: onUp,
    onPointerLeave: () => setHover(null),
    ...(bar === "h"
      ? {
          "aria-orientation": "horizontal" as const,
          "aria-valuemin": 0,
          "aria-valuemax": N - 1,
          "aria-valuenow": current,
          "aria-valuetext": `${ERAS[current]!.name}, ${ERAS[current]!.year}`,
        }
      : {
          "aria-orientation": "vertical" as const,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": Math.round(vpv * 100),
        }),
  });
  // Each part of a bar renders in its own interaction state
  const stateOf = (bar: Bar, region: Region): ElState =>
    pressed?.bar === bar && pressed.region === region
      ? "active"
      : !pressed && hover?.bar === bar && hover.region === region
        ? "hover"
        : undefined;
  const barStyles = (bar: Bar) => {
    const barOn = hover?.bar === bar || pressed?.bar === bar;
    const buttons = {} as Record<
      ButtonKey,
      { s: typeof s; glyphs: ReturnType<typeof glyphsAt> }
    >;
    for (const k of BUTTONS) {
      const st = stateOf(bar, k);
      buttons[k] = {
        s: styleAt(tv, { bar: barOn, arrow: st }),
        glyphs: glyphsAt(tv, st === "active"),
      };
    }
    return {
      s: barOn ? styleAt(tv, { bar: true }) : s,
      thumbS: styleAt(tv, { bar: barOn, thumb: stateOf(bar, "thumb") }),
      buttons,
    };
  };

  // Wheel / trackpad: follow continuously, then settle on the nearest era.
  useEffect(() => {
    let settle = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const px = e.deltaMode === 1 ? d * 16 : d;
      if (vRef.current?.contains(e.target as Node)) {
        vGo(vTarget.current + px / (V_LEN * S * 3)); // as if the document were ~3 screens tall
        return;
      }
      target.current = clamp(
        target.current + px / Math.max(60, spacing),
        0,
        N - 1,
      );
      anim.current?.stop();
      anim.current = animate(t, target.current, {
        type: "spring",
        stiffness: 500,
        damping: 50,
      });
      clearTimeout(settle);
      settle = window.setTimeout(() => go(target.current), 90);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(settle);
    };
  }, [go, spacing, t, vGo, S]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(N - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, step]);

  const labelT = stepped(tv);
  const near = (i: number) => clamp(1 - Math.abs(tv - i));

  return (
    <main
      className="fixed inset-0 flex select-none flex-col items-center justify-center overflow-hidden bg-white text-[#111] antialiased"
      style={{ fontFamily: FONT }}
    >
      <div className="relative mb-14">
        <Scrollbar
          {...barStyles("v")}
          length={V_LEN}
          box={BOX}
          scale={S}
          thumbStart={vc - s.vThumb / 2}
          thumbLen={s.vThumb}
          svgProps={barProps("v")}
        />
        {/* Hugs the scrollbar's live edge, top-aligned with it */}
        <div
          className="absolute top-0 whitespace-nowrap"
          style={{
            left: ((BOX + s.w) / 2 + PAD) * S + 20,
            marginTop: PAD * S - 5,
          }}
          aria-live="polite"
        >
          <Title t={labelT} />
          <YearCounter t={labelT} />
          <span className="sr-only">
            {ERAS[current]!.name}, {ERAS[current]!.year}
          </span>
        </div>
      </div>

      <div className="relative">
        <Scrollbar
          {...barStyles("h")}
          length={hLen}
          box={BOX}
          scale={S}
          horizontal
          thumbStart={hc - s.hThumb / 2}
          thumbLen={s.hThumb}
          svgProps={barProps("h")}
        />

        <div className="relative mt-3 h-8">
          {ERAS.map((e, i) => {
            const k = near(i);
            const shade = Math.round(185 - 168 * k);
            const color = `rgb(${shade},${shade},${shade})`;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => go(i)}
                className="absolute top-0 flex -translate-x-1/2 cursor-default flex-col items-center px-1.5"
                style={{ left: (labelPos[i]! + PAD) * S }}
              >
                <span
                  className="block w-px"
                  style={{
                    height: 4 + 3 * k,
                    background: compact ? "rgb(185,185,185)" : color,
                  }}
                />
                {!compact && (
                  <span
                    className="mt-1.5 text-[12px] tabular-nums"
                    style={{ color }}
                  >
                    {e.year}
                  </span>
                )}
              </button>
            );
          })}
          {/* Too tight for every label: one year rides along under the thumb instead */}
          {compact && (
            <div
              className="pointer-events-none absolute top-[11px] -translate-x-1/2"
              style={{ left: (hc + PAD) * S }}
            >
              <YearCounter
                t={labelT}
                className="text-[12px] text-neutral-900"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Labels hold still near each era and do their whole hand-off in the middle
// slice of the step, while the scrollbar itself keeps morphing continuously.
const LABEL_WINDOW = 0.65;
function stepped(t: number) {
  const i = Math.floor(t);
  return i + smooth((t - i - 0.5) / LABEL_WINDOW + 0.5);
}

const TITLE_ROW = 34;
const EDGE_MASK =
  "linear-gradient(transparent, #000 22%, #000 78%, transparent)";

// Names roll like the year counter — the old one exits upward, the new one
// arrives from below — blurring and fading as they travel.
function Title({ t }: { t: number }) {
  return (
    <div
      className="relative overflow-hidden text-[18px] font-medium tracking-[-0.015em] text-neutral-900"
      style={{
        height: TITLE_ROW,
        margin: `${(26 - TITLE_ROW) / 2}px 0`,
        maskImage: EDGE_MASK,
        WebkitMaskImage: EDGE_MASK,
      }}
      aria-hidden
    >
      {/* sizer so the absolutely-positioned rows have a width to live in */}
      <div className="invisible" style={{ lineHeight: `${TITLE_ROW}px` }}>
        {ERAS.reduce((w, e) => (e.name.length > w.length ? e.name : w), "")}
      </div>
      {ERAS.map((e, i) => {
        const d = i - t;
        const ad = Math.abs(d);
        const o = smooth(1 - ad * 1.4);
        if (o <= 0.001) return null;
        return (
          <div
            key={i}
            className="absolute top-0 left-0"
            style={{
              lineHeight: `${TITLE_ROW}px`,
              opacity: o,
              filter: ad > 0.001 ? `blur(${ad * 6}px)` : undefined,
              transform: `translateY(${d * TITLE_ROW}px)`,
            }}
          >
            {e.name}
          </div>
        );
      })}
    </div>
  );
}

const DIGIT_MASK =
  "linear-gradient(transparent, #000 25%, #000 75%, transparent)";
const ROW = 1.875; // digit row pitch in em — taller than a glyph so only one digit shows at rest

// A counter: only the digits that differ between neighbouring years roll,
// always counting forward (9 → 0 rolls on through 10).
function YearCounter({
  t,
  className = "-mt-0.5 text-[16px] text-neutral-400",
}: {
  t: number;
  className?: string;
}) {
  const tt = clamp(t, 0, N - 1);
  const i = Math.min(N - 2, Math.floor(tt));
  const f = tt - i; // already eased by stepped()
  const a = String(ERAS[i]!.year);
  const b = String(ERAS[i + 1]!.year);
  return (
    <div className={`flex tabular-nums ${className}`} aria-hidden>
      {[...a].map((ch, k) => {
        const from = Number(ch);
        let to = Number(b[k]!);
        if (to < from) to += 10;
        const pos = from + (to - from) * f;
        return (
          <div
            key={k}
            className="relative overflow-hidden"
            style={{
              height: `${ROW}em`,
              maskImage: DIGIT_MASK,
              WebkitMaskImage: DIGIT_MASK,
            }}
          >
            <div style={{ transform: `translateY(${-pos * ROW}em)` }}>
              {Array.from({ length: 20 }, (_, n) => (
                <div
                  key={n}
                  style={{ height: `${ROW}em`, lineHeight: `${ROW}em` }}
                >
                  {n % 10}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
