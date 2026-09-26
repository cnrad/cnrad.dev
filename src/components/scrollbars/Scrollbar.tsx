import { useId, type ReactNode, type SVGProps } from "react";
import { BITMAPS, type Bitmap } from "./bitmaps";
import {
  clamp,
  layout,
  rgba,
  smooth,
  type ButtonKey,
  type GlyphLayer,
  type Layout,
  type RGBA,
  type Seg,
  type Style,
} from "./eras";

export type Region = keyof Layout | "thumb";

export const PAD = 1;

type Pt = [number, number];
const poly = (pts: Pt[], cx: number, cy: number, size: number) =>
  pts.map(([x, y]) => `${cx + x * size},${cy + y * size}`).join(" ");

// Vector glyphs (2001 onward), pointing up, centered on 0,0
const TRI: Pt[] = [
  [0, -0.15],
  [0.23, 0.11],
  [-0.23, 0.11],
];
const CHEVRON: Pt[] = [
  [-0.24, 0.1],
  [0, -0.13],
  [0.24, 0.1],
];
// Windows 10's arrow, in its native 15×17 px cell
const W10: Pt[] = [
  [0, -3.2],
  [-3.5, 0.2],
  [-3.5, 3.2],
  [0, -0.2],
  [3.5, 3.2],
  [3.5, 0.2],
];

const flipV = (bm: Bitmap) => [...bm].reverse();
const transpose = (bm: Bitmap) =>
  [...bm[0]!].map((_, x) => bm.map((row) => row[x]).join(""));

/** One path per color, built from horizontal runs of pixels. */
function Pixels({
  bm,
  x,
  y,
  colors,
}: {
  bm: Bitmap;
  x: number;
  y: number;
  colors: Record<string, string>;
}) {
  const d: Record<string, string> = {};
  bm.forEach((row, r) => {
    let c0 = 0;
    for (let c = 1; c <= row.length; c++) {
      if (c < row.length && row[c] === row[c0]) continue;
      const ch = row[c0]!;
      if (ch !== ".")
        d[ch] = (d[ch] ?? "") + `M${x + c0} ${y + r}h${c - c0}v1h${c0 - c}z`;
      c0 = c;
    }
  });
  return (
    <>
      {Object.entries(d).map(([ch, path]) => (
        <path key={ch} d={path} fill={colors[ch]} />
      ))}
    </>
  );
}

interface Props {
  s: Style; // the bar as a whole (body, track, geometry)
  thumbS: Style; // thumb, in its hover/drag state
  buttons: Record<ButtonKey, { s: Style; glyphs: GlyphLayer[] }>;
  length: number;
  box: number;
  scale: number;
  horizontal?: boolean;
  thumbStart: number;
  thumbLen: number;
  svgProps?: SVGProps<SVGSVGElement>;
}

export function Scrollbar({
  s,
  thumbS,
  buttons,
  length: L,
  box,
  scale,
  horizontal,
  thumbStart,
  thumbLen,
  svgProps,
}: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const snap = s.pixel >= 0.5;
  const px = snap ? Math.round : (v: number) => v;
  const g = layout(s, L);
  const w = px(s.w);
  const x0 = snap ? Math.floor((box - w) / 2) : (box - w) / 2;
  const cx = x0 + w / 2;
  const len = (seg: Seg) => seg[1] - seg[0];
  const mid = (seg: Seg) => (seg[0] + seg[1]) / 2;
  const fw = s.frameW;
  const frame = rgba(s.frame);

  // 1px bevel rings as filled pixel rows, `start` px in from the rect's edge
  const rings = (
    x: number,
    y: number,
    rw: number,
    rh: number,
    start: number,
    cols: RGBA[],
  ) => {
    const out: ReactNode[] = [];
    for (let k = 0; k < 2; k++) {
      const lc = cols[k * 2]!;
      const dc = cols[k * 2 + 1]!;
      const r = px(start) + k;
      const iw = rw - r * 2;
      const ih = rh - r * 2;
      if (iw < 2 || ih < 2) break;
      if (lc[3] > 0.004) {
        out.push(
          <rect
            key={`l${k}a`}
            x={x + r}
            y={y + r}
            width={iw - 1}
            height={1}
            fill={rgba(lc)}
          />,
        );
        out.push(
          <rect
            key={`l${k}b`}
            x={x + r}
            y={y + r}
            width={1}
            height={ih - 1}
            fill={rgba(lc)}
          />,
        );
      }
      if (dc[3] > 0.004) {
        out.push(
          <rect
            key={`d${k}a`}
            x={x + r}
            y={y + rh - r - 1}
            width={iw}
            height={1}
            fill={rgba(dc)}
          />,
        );
        out.push(
          <rect
            key={`d${k}b`}
            x={x + rw - r - 1}
            y={y + r}
            width={1}
            height={ih}
            fill={rgba(dc)}
          />,
        );
      }
    }
    return out;
  };

  // A stroke drawn entirely inside its rect, so 1px lines land on whole pixels
  const inner = (
    x: number,
    y: number,
    rw: number,
    rh: number,
    r: number,
    sw = 1,
  ) => ({
    x: x + sw / 2,
    y: y + sw / 2,
    width: Math.max(0, rw - sw),
    height: Math.max(0, rh - sw),
    rx: Math.max(0, r - sw / 2),
  });

  const glyph = (
    layer: GlyphLayer,
    b: Style,
    gx: number,
    gy: number,
    down: boolean,
    u: number,
    upright = false,
  ) => {
    const colors = { "#": rgba(b.glyph), o: rgba(b.hollowFill) };
    const shift = px(b.glyphShift);
    if (layer.id in BITMAPS) {
      let bm: Bitmap = BITMAPS[layer.id as keyof typeof BITMAPS];
      if (down) bm = flipV(bm);
      // Keep text-like glyphs upright when the whole drawing is transposed
      if (upright && horizontal) bm = transpose(bm);
      const bx = Math.floor(gx - bm[0]!.length / 2) + shift;
      const by = Math.floor(gy - bm.length / 2) + shift;
      return (
        <g key={layer.id} opacity={layer.o}>
          <Pixels bm={bm} x={bx} y={by} colors={colors} />
        </g>
      );
    }
    const rot = down ? `rotate(180 ${gx} ${gy})` : undefined;
    const cxs = gx + shift;
    const cys = gy + shift;
    switch (layer.id) {
      case "chevron":
        return (
          <polyline
            key={layer.id}
            opacity={layer.o}
            transform={rot}
            points={poly(CHEVRON, cxs, cys, u)}
            fill="none"
            stroke={colors["#"]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case "aquaTri":
        return (
          <polygon
            key={layer.id}
            opacity={layer.o}
            transform={rot}
            points={poly(TRI, cxs, cys, u * 1.1)}
            fill={colors["#"]}
          />
        );
      case "vistaTri":
        return (
          <polygon
            key={layer.id}
            opacity={layer.o}
            transform={rot}
            points={poly(TRI, cxs, cys, u * 0.55)}
            fill={colors["#"]}
          />
        );
      case "w10":
        return (
          <polygon
            key={layer.id}
            opacity={layer.o}
            transform={rot}
            points={poly(W10, cxs, cys, 1)}
            fill={colors["#"]}
          />
        );
    }
    return null;
  };

  const button = (key: ButtonKey, seg: Seg, weight: number, down: boolean) => {
    const l = len(seg);
    if (l < 0.05) return null;
    const { s: b, glyphs } = buttons[key];
    const vis = smooth((weight - 0.25) / 0.75);
    const ai = b.arrowInset;
    const bx = x0 + ai;
    const by = seg[0] + ai;
    const bw = w - ai * 2;
    const bh = Math.max(0, l - ai * 2);
    const r = Math.min(b.arrowR, bw / 2, bh / 2);
    const u = Math.min(w, b.arrowLen) * clamp(l / b.arrowLen);
    const isExtra = key === "extraTop" || key === "extraBot";
    const chrome = b.arrowFill[3];
    return (
      <g key={key} style={b.invert > 0.5 ? { filter: "invert(1)" } : undefined}>
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={r}
          fill={rgba(b.arrowFill)}
        />
        {b.btnGroove * chrome > 0.004 && (
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={r}
            fill={`url(#${id}groove)`}
            opacity={b.btnGroove * chrome}
          />
        )}
        {b.btnAqua * chrome > 0.004 && (
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={r}
            fill={`url(#${id}aquaShade)`}
            opacity={b.btnAqua * chrome}
          />
        )}
        {b.sheen * chrome > 0.004 && (
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={r}
            fill={`url(#${id}sheen)`}
            opacity={b.sheen * chrome}
          />
        )}
        {b.arrowStroke[3] > 0.004 && (
          <rect
            {...inner(bx, by, bw, bh, r)}
            fill="none"
            stroke={rgba(b.arrowStroke)}
          />
        )}
        {b.innerHi * chrome > 0.004 && (
          <rect
            {...inner(bx + 1, by + 1, bw - 2, bh - 2, r - 1)}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.85}
            opacity={b.innerHi * chrome}
          />
        )}
        {rings(
          x0 + px(ai),
          seg[0] + px(ai),
          w - px(ai) * 2,
          l - px(ai) * 2,
          b.ringStart,
          [b.ring1L, b.ring1D, b.ring2L, b.ring2D],
        )}
        <g opacity={vis}>
          {isExtra
            ? b.oPlusMinus > 0.004 && (
                <g opacity={b.oPlusMinus}>
                  {glyph(
                    {
                      id: key === "extraBot" ? "xeroxPlus" : "xeroxMinus",
                      inward: false,
                      o: 1,
                    },
                    b,
                    cx,
                    mid(seg),
                    false,
                    u,
                    true,
                  )}
                </g>
              )
            : glyphs.map((layer) =>
                glyph(layer, b, cx, mid(seg), down !== layer.inward, u),
              )}
        </g>
      </g>
    );
  };

  // Thumb
  const t = thumbS;
  const ts = px(thumbStart);
  const tl = px(thumbLen);
  const ti = px(t.thumbInset);
  const tx = x0 + ti;
  const tw = w - ti * 2;
  const tr = Math.min(t.thumbR, tw / 2, tl / 2);
  const tcy = ts + tl / 2;
  const gripO = t.grip * clamp((tl - 10) / 4);
  const gripX = snap ? Math.round(cx - t.gripW / 2) : cx - t.gripW / 2;
  const gripY = snap ? Math.round(tcy - 4) : tcy - 4;

  const tk = g.track;
  const trX = x0 + s.trackInset;
  const trY = tk[0] + s.trackInset;
  const trW = w - s.trackInset * 2;
  const trH = Math.max(0, len(tk) - s.trackInset * 2);
  const trR = Math.min(s.trackR, trW / 2, trH / 2);

  // Separators live inside the segment they close off: the last row of a
  // top-side segment, the first row of a bottom-side one.
  const seps = [
    ...[g.arrowTop[1], g.extraTop[1]].map((b) => b - fw),
    ...[g.extraBot[0], g.upBot[0], g.arrowBot[0]],
  ];

  const body: ReactNode = (
    <g transform={`translate(${PAD} ${PAD})`}>
      <rect
        x={x0}
        y={0}
        width={w}
        height={L}
        rx={s.bodyR}
        fill={rgba(s.bodyFill)}
      />

      <rect
        x={trX}
        y={trY}
        width={trW}
        height={trH}
        rx={trR}
        fill={rgba(s.trackFill)}
      />
      {s.dither > 0.004 && (
        <rect
          x={trX}
          y={trY}
          width={trW}
          height={trH}
          rx={trR}
          fill={`url(#${id}dither)`}
          opacity={s.dither}
        />
      )}
      {s.dots > 0.004 && (
        <rect
          x={trX}
          y={trY}
          width={trW}
          height={trH}
          rx={trR}
          fill={`url(#${id}dots)`}
          opacity={s.dots}
        />
      )}
      {s.groove > 0.004 && (
        <rect
          x={trX}
          y={trY}
          width={trW}
          height={trH}
          rx={trR}
          fill={`url(#${id}groove)`}
          opacity={s.groove}
        />
      )}

      {button("arrowTop", g.arrowTop, s.arrowTop, false)}
      {button("extraTop", g.extraTop, 1, false)}
      {button("extraBot", g.extraBot, 1, true)}
      {button("upBot", g.upBot, s.upBot, false)}
      {button("arrowBot", g.arrowBot, s.arrowBot, true)}

      {s.sep > 0.004 && s.frame[3] > 0.004 && (
        <g fill={frame} opacity={s.sep}>
          {seps.map((y, i) =>
            y >= fw && y <= L - fw * 2 ? (
              <rect key={i} x={x0} y={y} width={w} height={fw} />
            ) : null,
          )}
        </g>
      )}
      {s.frame[3] > 0.004 && (
        <rect
          {...inner(x0, 0, w, L, s.bodyR, fw)}
          fill="none"
          stroke={frame}
          strokeWidth={fw}
        />
      )}

      <g style={t.thumbInvert > 0.5 ? { filter: "invert(1)" } : undefined}>
        <rect
          x={tx}
          y={ts}
          width={tw}
          height={tl}
          rx={tr}
          fill={rgba(t.thumbFill)}
        />
        {t.thumbDots > 0.004 && (
          <rect
            x={tx}
            y={ts}
            width={tw}
            height={tl}
            fill={`url(#${id}dots)`}
            opacity={t.thumbDots}
          />
        )}
        {t.aqua > 0.004 && (
          <g opacity={t.aqua}>
            <rect
              x={tx}
              y={ts}
              width={tw}
              height={tl}
              rx={tr}
              fill={`url(#${id}aquaShade)`}
            />
            <rect
              x={tx}
              y={ts}
              width={tw}
              height={tl}
              rx={tr}
              fill={`url(#${id}aquaStripe)`}
            />
            <rect
              x={tx + tw * 0.14}
              y={ts + 2.5}
              width={tw * 0.34}
              height={Math.max(0, tl - 5)}
              rx={Math.min(tw * 0.17, (tl - 5) / 2)}
              fill={`url(#${id}aquaGloss)`}
            />
          </g>
        )}
        {t.sheen > 0.004 && (
          <rect
            x={tx}
            y={ts}
            width={tw}
            height={tl}
            rx={tr}
            fill={`url(#${id}sheen)`}
            opacity={t.sheen}
          />
        )}
        {rings(tx, ts, tw, tl, t.tRingStart, [
          t.tRing1L,
          t.tRing1D,
          t.tRing2L,
          t.tRing2D,
        ])}
        {t.innerHi > 0.004 && (
          <rect
            {...inner(tx + 1, ts + 1, tw - 2, tl - 2, tr - 1)}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.85}
            opacity={t.innerHi}
          />
        )}
        {gripO > 0.004 && (
          <g opacity={gripO}>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect
                  x={gripX}
                  y={gripY + i * 2}
                  width={t.gripW}
                  height={1}
                  fill={rgba(t.gripLight)}
                />
                <rect
                  x={gripX}
                  y={gripY + i * 2 + 1}
                  width={t.gripW}
                  height={1}
                  fill={rgba(t.gripDark)}
                />
              </g>
            ))}
          </g>
        )}
        {t.dimple > 0.004 && (
          <g opacity={t.dimple}>
            <Pixels
              bm={BITMAPS.nextDimple}
              x={Math.floor(cx - 2)}
              y={Math.floor(tcy - 2)}
              colors={{ "#": "#555", o: "#fff" }}
            />
          </g>
        )}
        {t.thumbStroke[3] > 0.004 && (
          <rect
            {...inner(tx, ts, tw, tl, tr)}
            fill="none"
            stroke={rgba(t.thumbStroke)}
          />
        )}
      </g>
    </g>
  );

  const dc = rgba(s.ditherColor);
  const defs = (
    <defs>
      <pattern
        id={`${id}dither`}
        width={2}
        height={2}
        patternUnits="userSpaceOnUse"
      >
        <rect width={1} height={1} fill={dc} />
        <rect x={1} y={1} width={1} height={1} fill={dc} />
      </pattern>
      <pattern
        id={`${id}dots`}
        width={4}
        height={4}
        patternUnits="userSpaceOnUse"
      >
        <rect x={1} y={0} width={1} height={1} fill={dc} />
        <rect x={3} y={1} width={1} height={1} fill={dc} />
        <rect x={1} y={2} width={1} height={1} fill={dc} />
        <rect x={3} y={3} width={1} height={1} fill={dc} />
      </pattern>
      <pattern
        id={`${id}aquaStripe`}
        width={6}
        height={6}
        patternUnits="userSpaceOnUse"
      >
        <rect width={6} height={3} fill="rgba(255,255,255,0.07)" />
      </pattern>
      <linearGradient id={`${id}groove`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity={0.2} />
        <stop offset="0.35" stopColor="#000" stopOpacity={0.03} />
        <stop offset="0.7" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.08} />
      </linearGradient>
      <linearGradient id={`${id}sheen`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity={0.7} />
        <stop offset="0.55" stopColor="#fff" stopOpacity={0.1} />
        <stop offset="1" stopColor="#000" stopOpacity={0.08} />
      </linearGradient>
      <linearGradient id={`${id}aquaShade`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#0b2a78" stopOpacity={0.55} />
        <stop offset="0.18" stopColor="#0b2a78" stopOpacity={0.1} />
        <stop offset="0.55" stopColor="#fff" stopOpacity={0.05} />
        <stop offset="0.82" stopColor="#bfe3ff" stopOpacity={0.45} />
        <stop offset="1" stopColor="#0b2a78" stopOpacity={0.35} />
      </linearGradient>
      <linearGradient id={`${id}aquaGloss`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
        <stop offset="1" stopColor="#fff" stopOpacity={0.15} />
      </linearGradient>
    </defs>
  );

  const W = box + PAD * 2;
  const H = L + PAD * 2;
  const shapeRendering = snap ? "crispEdges" : "auto";

  return horizontal ? (
    <svg
      width={H * scale}
      height={W * scale}
      viewBox={`0 0 ${H} ${W}`}
      shapeRendering={shapeRendering}
      {...svgProps}
    >
      {defs}
      <g transform="matrix(0 1 1 0 0 0)">{body}</g>
    </svg>
  ) : (
    <svg
      width={W * scale}
      height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering={shapeRendering}
      {...svgProps}
    >
      {defs}
      {body}
    </svg>
  );
}
