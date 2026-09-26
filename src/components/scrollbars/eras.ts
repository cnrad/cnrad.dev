// Every scrollbar is described by the same flat set of numbers and colors.
// Because each era fills in every field, any fractional position between two
// eras can be rendered by interpolating field-by-field — that's the morph.
//
// Geometry is authored for a *vertical* scrollbar (x = across, y = along), in
// the native pixels of the original screens. The horizontal scrollbar is the
// same drawing, transposed.

import { BITMAPS } from "./bitmaps";

export type RGBA = [number, number, number, number];

const c = (hex: string, a = 1): RGBA => {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    a,
  ];
};
const NONE = c("#000", 0);

export const rgba = (v: RGBA) =>
  `rgba(${v[0].toFixed(1)},${v[1].toFixed(1)},${v[2].toFixed(1)},${v[3].toFixed(3)})`;

const BASE = {
  w: 16, // thickness
  pixel: 1, // 1 = draw on the native pixel grid (everything before 2001)

  // body
  bodyFill: c("#fff"),
  bodyR: 0,
  frame: c("#000"),
  frameW: 1,
  sep: 1, // opacity of separator lines between segments

  // track (the channel between the buttons)
  trackFill: c("#fff"),
  trackInset: 0,
  trackR: 0,
  dither: 0, // 50% checkerboard
  dots: 0, // 25% dot screen (Macintosh desktop gray)
  ditherColor: c("#000"),
  groove: 0, // soft channel shading (Aqua, XP, Lion)

  // segments along the axis, in px
  extraTop: 0,
  extraBot: 0,
  // arrow buttons, as 0..1 weights of arrowLen
  arrowTop: 1,
  arrowBot: 1,
  upBot: 0, // an extra up arrow stacked above the bottom one (NeXT, Mac OS 8)
  arrowLen: 16,

  // button appearance
  arrowFill: c("#fff"),
  arrowStroke: NONE,
  arrowInset: 0,
  arrowR: 0,
  // Two rings of 1px bevel inside each button, starting `ringStart` px in
  ringStart: 0,
  ring1L: NONE,
  ring1D: NONE,
  ring2L: NONE,
  ring2D: NONE,
  sheen: 0, // XP-style highlight on buttons + thumb
  innerHi: 0, // white inner edge on buttons + thumb (XP, Vista)
  btnGroove: 0, // channel shading on buttons (Aqua)
  btnAqua: 0, // gel shading on buttons (Aqua, pressed)
  invert: 0, // pressed = inverted (Xerox, Windows 1.0, AmigaOS)

  // glyphs
  glyph: c("#000"),
  hollowFill: c("#fff"),
  glyphShift: 0, // pressed buttons nudge their glyph down-right
  oPlusMinus: 0, // Xerox paging boxes

  // thumb
  vThumb: 16, // length in the vertical showcase
  hThumb: 16, // length in the horizontal scrubber
  thumbFill: c("#fff"),
  thumbStroke: c("#000"),
  thumbInset: 0,
  thumbR: 0,
  tRingStart: 0,
  tRing1L: NONE,
  tRing1D: NONE,
  tRing2L: NONE,
  tRing2D: NONE,
  thumbDots: 0,
  aqua: 0,
  grip: 0,
  gripW: 8,
  gripDark: c("#000"),
  gripLight: c("#fff"),
  dimple: 0,
  thumbInvert: 0,
};

export type Style = typeof BASE;
type NumKey = {
  [K in keyof Style]: Style[K] extends number ? K : never;
}[keyof Style];

// Decorative layers ease in/out rather than lerping linearly.
const FADE = new Set<NumKey>([
  "oPlusMinus",
  "aqua",
  "grip",
  "dimple",
  "sheen",
  "innerHi",
  "btnGroove",
  "btnAqua",
  "dither",
  "dots",
  "thumbDots",
  "groove",
]);

export type GlyphId =
  | keyof typeof BITMAPS
  | "chevron"
  | "aquaTri"
  | "vistaTri"
  | "w10";

type Partial2 = Partial<Style>;

export interface Era {
  year: number;
  name: string;
  style: Style;
  glyph: GlyphId;
  glyphActive?: GlyphId;
  inward?: boolean; // single arrows point into the track (Xerox Star)
  // Interaction states, layered over the base style
  barHover?: Partial2;
  arrowHover?: Partial2;
  arrowActive?: Partial2;
  thumbHover?: Partial2;
  thumbActive?: Partial2;
}

const era = (e: Omit<Era, "style"> & { style: Partial2 }): Era => ({
  ...e,
  style: { ...BASE, ...e.style },
});

const SILVER = c("#c0c0c0");
const GREY = c("#808080");
const WHITE = c("#fff");
const BLACK = c("#000");

export const ERAS: Era[] = [
  era({
    year: 1981,
    name: "Xerox Star",
    glyph: "xeroxUp",
    inward: true,
    style: {
      w: 12,
      arrowLen: 36,
      extraTop: 18,
      extraBot: 18,
      oPlusMinus: 1,
      thumbDots: 1,
      vThumb: 40,
      hThumb: 36,
    },
    arrowActive: { invert: 1 },
  }),
  era({
    year: 1983,
    name: "Apple Lisa",
    glyph: "lisaUp",
    glyphActive: "lisaUpActive",
    style: {
      w: 24,
      arrowLen: 16,
      dots: 1,
      thumbInset: 1,
      vThumb: 16,
      hThumb: 16,
    },
  }),
  era({
    year: 1984,
    name: "Macintosh System 1",
    glyph: "macUp",
    glyphActive: "macUpActive",
    style: {
      w: 16,
      arrowLen: 16,
      dots: 1,
      thumbInset: 1,
      vThumb: 16,
      hThumb: 16,
    },
  }),
  era({
    year: 1985,
    name: "AmigaOS 1.0",
    glyph: "amigaUp",
    style: {
      w: 16,
      arrowLen: 14,
      frame: NONE,
      sep: 0,
      arrowFill: NONE,
      glyph: c("#0057af"),
      trackFill: c("#0057af"),
      trackInset: 2,
      thumbStroke: NONE,
      thumbInset: 4,
      vThumb: 96,
      hThumb: 40,
    },
    arrowActive: { invert: 1 },
    thumbActive: { thumbInvert: 1 },
  }),
  era({
    year: 1985,
    name: "Windows 1.0",
    glyph: "win1Up",
    style: {
      w: 13,
      arrowLen: 21,
      trackFill: c("#ff5555"),
      vThumb: 20,
      hThumb: 20,
    },
    arrowActive: { invert: 1 },
  }),
  era({
    year: 1989,
    name: "NeXTSTEP 1.0",
    glyph: "nextUp",
    style: {
      w: 18,
      arrowTop: 0,
      upBot: 1,
      arrowLen: 17,
      frame: NONE,
      sep: 0,
      bodyFill: c("#aaa"),
      trackFill: c("#aaa"),
      trackInset: 1,
      dither: 1,
      ditherColor: c("#555"),
      arrowFill: c("#aaa"),
      arrowInset: 1,
      ring1L: WHITE,
      ring1D: BLACK,
      ring2D: c("#555"),
      thumbFill: c("#aaa"),
      thumbStroke: NONE,
      thumbInset: 1,
      tRing1L: WHITE,
      tRing1D: BLACK,
      tRing2D: c("#555"),
      dimple: 1,
      vThumb: 112,
      hThumb: 44,
    },
    arrowActive: { arrowFill: WHITE, ring1D: c("#555"), ring2D: c("#aaa") },
  }),
  era({
    year: 1990,
    name: "Windows 3.0",
    glyph: "win3Up",
    style: {
      w: 17,
      arrowLen: 17,
      arrowFill: SILVER,
      ringStart: 1,
      ring1L: WHITE,
      ring1D: GREY,
      ring2L: WHITE,
      ring2D: GREY,
      dither: 1,
      ditherColor: SILVER,
      thumbFill: SILVER,
      tRingStart: 1,
      tRing1L: WHITE,
      tRing1D: GREY,
      tRing2L: WHITE,
      tRing2D: GREY,
      vThumb: 17,
      hThumb: 17,
    },
    arrowActive: {
      ring1L: GREY,
      ring1D: SILVER,
      ring2L: GREY,
      ring2D: SILVER,
      glyphShift: 1,
    },
  }),
  era({
    year: 1991,
    name: "System 7",
    glyph: "sys7Up",
    glyphActive: "sys7UpActive",
    style: {
      w: 16,
      arrowLen: 16,
      bodyFill: c("#ddd"),
      trackFill: c("#ddd"),
      dots: 1,
      ditherColor: c("#777"),
      arrowFill: c("#ddd"),
      ringStart: 1,
      ring1L: WHITE,
      ring1D: c("#777"),
      ring2L: WHITE,
      ring2D: c("#777"),
      glyph: c("#336"),
      hollowFill: c("#a3a3d7"),
      thumbFill: c("#aaa"),
      thumbStroke: NONE,
      thumbInset: 1,
      tRing1L: c("#ccf"),
      tRing1D: c("#336"),
      tRing2L: c("#ccf"),
      grip: 1,
      gripW: 6,
      gripLight: c("#ccf"),
      gripDark: c("#669"),
      vThumb: 16,
      hThumb: 16,
    },
    arrowActive: { glyph: BLACK },
  }),
  era({
    year: 1995,
    name: "Windows 95",
    glyph: "tri7",
    style: {
      w: 16,
      arrowLen: 16,
      frame: NONE,
      sep: 0,
      arrowFill: SILVER,
      ring1L: SILVER,
      ring1D: BLACK,
      ring2L: WHITE,
      ring2D: GREY,
      dither: 1,
      ditherColor: SILVER,
      thumbFill: SILVER,
      thumbStroke: NONE,
      tRing1L: SILVER,
      tRing1D: BLACK,
      tRing2L: WHITE,
      tRing2D: GREY,
      vThumb: 96,
      hThumb: 44,
    },
    arrowActive: {
      ring1L: GREY,
      ring1D: GREY,
      ring2L: NONE,
      ring2D: NONE,
      glyphShift: 1,
    },
  }),
  era({
    year: 1997,
    name: "Mac OS 8",
    glyph: "tri7",
    style: {
      w: 16,
      arrowTop: 0,
      upBot: 1,
      arrowLen: 16,
      trackFill: c("#aaa"),
      arrowFill: c("#ddd"),
      ringStart: 1,
      ring1L: WHITE,
      ring1D: c("#bbb"),
      thumbFill: c("#9996ff"),
      tRingStart: 1,
      tRing1L: c("#cccbff"),
      tRing1D: c("#6563cf"),
      grip: 1,
      gripW: 8,
      gripLight: c("#eee"),
      gripDark: c("#333399"),
      vThumb: 16,
      hThumb: 16,
    },
    arrowActive: { arrowFill: c("#777"), ring1L: c("#555"), ring1D: c("#999") },
    thumbActive: {
      thumbFill: c("#6563cf"),
      tRing1L: c("#9996ff"),
      tRing1D: c("#322e9c"),
    },
  }),
  era({
    year: 2001,
    name: "Windows XP",
    glyph: "chevron",
    style: {
      w: 17,
      pixel: 0,
      arrowLen: 17,
      frame: NONE,
      sep: 0,
      bodyFill: c("#f7f6f2"),
      trackFill: c("#f7f6f2"),
      groove: 0.35,
      arrowFill: c("#c6d4fe"),
      arrowStroke: c("#b2c6fa"),
      arrowInset: 1,
      arrowR: 3,
      sheen: 1,
      innerHi: 1,
      glyph: c("#4a5e88"),
      thumbFill: c("#c6d4fe"),
      thumbStroke: c("#b2c6fa"),
      thumbInset: 1,
      thumbR: 3,
      grip: 1,
      gripW: 8,
      gripDark: c("#8caaf0"),
      gripLight: c("#eef3ff"),
      vThumb: 96,
      hThumb: 48,
    },
    arrowHover: { arrowFill: c("#daedff"), arrowStroke: c("#93abe9") },
    arrowActive: { arrowFill: c("#879ff9"), arrowStroke: c("#8089de") },
    thumbHover: {
      thumbFill: c("#d4e8ff"),
      thumbStroke: c("#a5c7ff"),
      gripDark: c("#a2c5ff"),
    },
    thumbActive: {
      thumbFill: c("#a4bafd"),
      thumbStroke: c("#7f96dc"),
      gripDark: c("#7f96dc"),
    },
  }),
  era({
    year: 2001,
    name: "Mac OS X 10.0",
    glyph: "aquaTri",
    style: {
      w: 16,
      pixel: 0,
      arrowLen: 16,
      frame: c("#bdbdbd"),
      sep: 0,
      bodyFill: c("#e6e6e6"),
      trackInset: 0.5,
      trackR: 7.5,
      groove: 1,
      arrowFill: c("#ededed"),
      btnGroove: 0.6,
      glyph: c("#434343"),
      thumbFill: c("#3a8cf3"),
      thumbStroke: c("#2a5fc0"),
      thumbInset: 1,
      thumbR: 7,
      aqua: 1,
      vThumb: 84,
      hThumb: 50,
    },
    arrowActive: {
      arrowFill: c("#5a9ef0"),
      btnGroove: 0,
      btnAqua: 1,
      glyph: c("#08101a"),
    },
  }),
  era({
    year: 2007,
    name: "Windows Vista",
    glyph: "vistaTri",
    style: {
      w: 17,
      pixel: 0,
      arrowLen: 17,
      frame: c("#e6e6e6"),
      sep: 0,
      bodyFill: c("#f0f0f0"),
      trackFill: c("#f0f0f0"),
      groove: 0.3,
      // Button chrome only appears while the scrollbar is hovered
      arrowFill: c("#ececed", 0),
      arrowStroke: c("#979797", 0),
      arrowInset: 0.5,
      arrowR: 2,
      glyph: c("#4d4d4d"),
      thumbFill: c("#e6e6e8"),
      thumbStroke: c("#979797"),
      thumbInset: 0.5,
      thumbR: 2,
      sheen: 0.9,
      innerHi: 0.8,
      grip: 1,
      gripW: 6,
      gripDark: c("#666"),
      gripLight: c("#fff"),
      vThumb: 84,
      hThumb: 44,
    },
    barHover: { arrowFill: c("#ececed"), arrowStroke: c("#979797") },
    arrowHover: {
      arrowFill: c("#c6ebfd"),
      arrowStroke: c("#307cb7"),
      glyph: c("#1c5a8a"),
    },
    arrowActive: {
      arrowFill: c("#8fd6f8"),
      arrowStroke: c("#005690"),
      glyph: c("#003f6b"),
    },
    thumbHover: {
      thumbFill: c("#c4e8fd"),
      thumbStroke: c("#1e79bd"),
      gripDark: c("#1e79bd"),
    },
    thumbActive: {
      thumbFill: c("#86d4fb"),
      thumbStroke: c("#005196"),
      gripDark: c("#005196"),
    },
  }),
  era({
    year: 2011,
    name: "OS X 10.7 Lion",
    glyph: "aquaTri",
    style: {
      w: 11,
      pixel: 0,
      arrowTop: 0,
      arrowBot: 0,
      arrowLen: 15,
      frame: c("#e3e3e3"),
      sep: 0,
      bodyFill: c("#fbfbfb"),
      trackFill: c("#fbfbfb"),
      groove: 0.25,
      thumbFill: c("#c1c1c1"),
      thumbStroke: NONE,
      thumbInset: 2.5,
      thumbR: 3,
      vThumb: 52,
      hThumb: 40,
    },
    thumbHover: { thumbFill: c("#959595") },
    thumbActive: { thumbFill: c("#7a7a7a") },
  }),
  era({
    year: 2015,
    name: "Windows 10",
    glyph: "w10",
    style: {
      w: 17,
      pixel: 0,
      arrowLen: 17,
      frame: NONE,
      sep: 0,
      bodyFill: c("#f0f0f0"),
      trackFill: c("#f0f0f0"),
      arrowFill: c("#f0f0f0"),
      arrowInset: 1,
      glyph: c("#606060"),
      thumbFill: c("#cdcdcd"),
      thumbStroke: NONE,
      thumbInset: 1,
      vThumb: 96,
      hThumb: 44,
    },
    arrowHover: { arrowFill: c("#dadada"), glyph: BLACK },
    arrowActive: { arrowFill: c("#606060"), glyph: WHITE },
    thumbHover: { thumbFill: c("#a6a6a6") },
    thumbActive: { thumbFill: c("#606060") },
  }),
  era({
    year: 2025,
    name: "macOS 26 Tahoe",
    glyph: "aquaTri",
    style: {
      w: 10,
      pixel: 0,
      arrowTop: 0,
      arrowBot: 0,
      arrowLen: 15,
      frame: NONE,
      sep: 0,
      bodyFill: c("#efefef"),
      bodyR: 5,
      trackFill: c("#efefef"),
      trackR: 5,
      thumbFill: c("#afafaf"),
      thumbStroke: NONE,
      thumbR: 5,
      vThumb: 92,
      hThumb: 48,
    },
    barHover: { bodyFill: c("#e9e9e9"), trackFill: c("#e9e9e9") },
    thumbHover: { thumbFill: c("#8c8c8c") },
    thumbActive: { thumbFill: c("#6b6b6b") },
  }),
];

export const N = ERAS.length;

export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, v));
export const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};

const ease = (a: number, b: number, f: number) => a + (b - a) * smooth(f);

// Premultiplied, so fading to/from transparent never passes through gray.
const mixColor = (a: RGBA, b: RGBA, f: number): RGBA => {
  const al = a[3] + (b[3] - a[3]) * f;
  if (al < 1e-4) return [0, 0, 0, 0];
  const ch = (i: 0 | 1 | 2) => (a[i] * a[3] * (1 - f) + b[i] * b[3] * f) / al;
  return [ch(0), ch(1), ch(2), al];
};

function mix(a: Style, b: Style, f: number): Style {
  if (f <= 0) return a;
  if (f >= 1) return b;
  const out = {} as Record<string, unknown>;
  for (const k in a) {
    const key = k as keyof Style;
    const av = a[key];
    const bv = b[key];
    if (Array.isArray(av)) out[k] = mixColor(av, bv as RGBA, f);
    else
      out[k] = FADE.has(key as NumKey)
        ? ease(av, bv as number, f)
        : av + ((bv as number) - av) * f;
  }
  return out as Style;
}

export type ElState = "hover" | "active" | undefined;
export interface Variant {
  bar?: boolean;
  arrow?: ElState;
  thumb?: ElState;
}

const variantCache = new Map<string, Style>();
function eraVariant(i: number, v: Variant): Style {
  const key = `${i}|${v.bar ? 1 : 0}|${v.arrow ?? ""}|${v.thumb ?? ""}`;
  let s = variantCache.get(key);
  if (!s) {
    const e = ERAS[i]!;
    s = {
      ...e.style,
      ...(v.bar || v.arrow || v.thumb ? e.barHover : undefined),
      ...(v.arrow === "hover"
        ? e.arrowHover
        : v.arrow === "active"
          ? e.arrowActive
          : undefined),
      ...(v.thumb === "hover"
        ? e.thumbHover
        : v.thumb === "active"
          ? e.thumbActive
          : undefined),
    };
    variantCache.set(key, s);
  }
  return s;
}

const split = (t: number) => {
  const tt = clamp(t, 0, N - 1);
  const i = Math.min(N - 2, Math.floor(tt));
  return [i, tt - i] as const;
};

export function styleAt(t: number, v: Variant = {}): Style {
  const [i, f] = split(t);
  return mix(eraVariant(i, v), eraVariant(i + 1, v), f);
}

export interface GlyphLayer {
  id: GlyphId;
  inward: boolean;
  o: number;
}

// Arrow glyphs swap shapes in the same spot, so they crossfade with a slight
// gap — the old shape is mostly gone before the new one arrives.
export function glyphsAt(t: number, active: boolean): GlyphLayer[] {
  const [i, f] = split(t);
  const pick = (e: Era) => ({
    id: (active && e.glyphActive) || e.glyph,
    inward: !!e.inward,
  });
  const a = pick(ERAS[i]!);
  const b = pick(ERAS[i + 1]!);
  if (a.id === b.id && a.inward === b.inward) return [{ ...a, o: 1 }];
  return [
    { ...a, o: 1 - smooth(f / 0.8) },
    { ...b, o: smooth((f - 0.2) / 0.8) },
  ].filter((l) => l.o > 0.004);
}

export type Seg = [number, number];

export function layout(s: Style, L: number) {
  // On the pixel grid every segment is a whole number of pixels
  const px = s.pixel >= 0.5 ? Math.round : (v: number) => v;
  let y = 0;
  const top = (len: number): Seg => [y, (y += px(len))];
  const arrowTop = top(s.arrowTop * s.arrowLen);
  const extraTop = top(s.extraTop);

  let e = L;
  const bot = (len: number): Seg => [(e -= px(len)), e + px(len)];
  // The bottom down-arrow is always the same button; NeXT-style layouts add
  // an up-arrow above it rather than swapping in a separate pair.
  const arrowBot = bot(s.arrowBot * s.arrowLen);
  const upBot = bot(s.upBot * s.arrowLen);
  const extraBot = bot(s.extraBot);

  const track: Seg = [y, e];
  return { arrowTop, extraTop, track, extraBot, upBot, arrowBot };
}

export type Layout = ReturnType<typeof layout>;
export type ButtonKey =
  | "arrowTop"
  | "extraTop"
  | "extraBot"
  | "upBot"
  | "arrowBot";
export const BUTTONS: ButtonKey[] = [
  "arrowTop",
  "extraTop",
  "extraBot",
  "upBot",
  "arrowBot",
];

// The scrubber thumb travels linearly between where the first era's thumb
// rests at the start and where the last era's rests at the end. Eras are
// evenly spaced along it, and the thumb still meets both ends of the track.
function band(L: number): [number, number] {
  const first = ERAS[0]!.style;
  const last = ERAS[N - 1]!.style;
  return [
    layout(first, L).track[0] + first.hThumb / 2,
    layout(last, L).track[1] - last.hThumb / 2,
  ];
}

/** Center of the horizontal scrubber's thumb at history position t. */
export function thumbCenter(L: number, t: number) {
  const [a, b] = band(L);
  return a + (t / (N - 1)) * (b - a);
}

export function tFromCenter(center: number, L: number) {
  const [a, b] = band(L);
  return clamp(((center - a) / (b - a)) * (N - 1), 0, N - 1);
}
