import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { cn } from "../../../lib/utils";
import { WritingCanvas } from "../WritingCanvas";

// --- Stereoscopy engine -----------------------------------------------------
//
// Write a scene ONCE and this renders it twice, side by side, as a stereo pair.
//
//   Geometry. Each panel is a CSS `perspective` viewport. Elements declare
//   their depth with <Depth z={n}> (translateZ, in px toward the viewer). The
//   ENTIRE stereo effect is one thing: each panel's `perspective-origin` is
//   shifted sideways by the eye separation, so the browser's 3D engine derives
//   correct, view-dependent parallax for every element from its own z — near
//   elements shift more than far ones. You never compute per-eye offsets.
//
//   State. A scene never holds its own useState; it reads engine hooks
//   (useControl / useField). With `enableSync` both panels share ONE store, so
//   hover, press, focus, typed text and a synthetic cursor are identical in
//   both eyes and the fused image is seamless. Without it each panel gets its
//   OWN store, so only the eye your mouse is physically over reacts — the eyes
//   disagree and the image flickers. Same scene code either way.

// The store is a generic keyed bag. When synced, both eyes read one bag, so ANY
// scene state a scene keeps (hover, a drag order, an open folder path) is
// identical in both — the fused image stays consistent. When unsynced, each eye
// gets its own bag and they diverge. `useShared` is the general escape hatch;
// useControl/useField are conveniences built on the same well-known keys.
type Bag = Record<string, unknown>;
type Store = {
  state: Bag;
  set: (updater: (prev: Bag) => Bag) => void;
};

const INITIAL: Bag = {};

// Depth in px per abstract z-unit — the live "Depth" control scales this.
const DepthContext = createContext(1);
const StoreContext = createContext<Store>({ state: INITIAL, set: () => {} });

/**
 * A slice of shared scene state, keyed by name. Returns a [value, setValue] pair
 * like useState, but the value lives in the engine's store so both eyes see it
 * (when synced). `setValue` accepts a value or an updater.
 */
export function useShared<T>(key: string, initial: T) {
  const { state, set } = useContext(StoreContext);
  const value = (key in state ? state[key] : initial) as T;
  const setValue = (next: T | ((prev: T) => T)) =>
    set((s) => {
      const prev = (key in s ? s[key] : initial) as T;
      const v =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      return { ...s, [key]: v };
    });
  return [value, setValue] as const;
}

/** The live px-per-depth-unit from the "Depth" control, for scenes that place
 *  geometry with raw translateZ (rotated faces, etc.) instead of <Depth>. */
export function useDepthScale() {
  return useContext(DepthContext);
}

/**
 * Handlers that turn the synthetic cursor into a pointing hand while over a
 * clickable thing (the native `cursor: pointer` affordance, but drawn into both
 * eyes from the shared store). Spread them onto the element.
 */
export function useHand() {
  const [, setHand] = useShared<boolean>("hand", false);
  return {
    onPointerEnter: () => setHand(true),
    onPointerLeave: () => setHand(false),
  };
}

/** Hover + press state for an interactive control, shared per the sync mode. */
export function useControl(id: string) {
  const [hovered, setHovered] = useShared<string | null>("hovered", null);
  const [pressed, setPressed] = useShared<string | null>("pressed", null);
  return {
    hovered: hovered === id,
    pressed: pressed === id,
    handlers: {
      onPointerEnter: () => setHovered(id),
      onPointerLeave: () => {
        setHovered((h) => (h === id ? null : h));
        setPressed((p) => (p === id ? null : p));
      },
      onPointerDown: () => setPressed(id),
      onPointerUp: () => setPressed((p) => (p === id ? null : p)),
    },
  };
}

/** A text field whose value/focus/hover are shared per the sync mode. */
export function useField(id = "field") {
  const [value, setValue] = useShared<string>("value", "");
  const [focused, setFocused] = useShared<string | null>("focused", null);
  const [hovered, setHovered] = useShared<string | null>("hovered", null);
  return {
    value,
    focused: focused === id,
    hovered: hovered === id,
    handlers: {
      onPointerEnter: () => setHovered(id),
      onPointerLeave: () => setHovered((h) => (h === id ? null : h)),
      onFocus: () => setFocused(id),
      onBlur: () => setFocused((f) => (f === id ? null : f)),
      onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    },
  };
}

/**
 * Places its children at a depth via translateZ. Positive z is toward the
 * viewer. The perspective viewport (each panel) turns that depth into the right
 * per-eye parallax automatically.
 */
export function Depth({
  z = 0,
  className,
  style,
  children,
}: {
  z?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const scale = useContext(DepthContext);
  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `translateZ(${z * scale}px)`,
        transformStyle: "preserve-3d",
        // Rasterization hint — keeps magnified text a touch crisper.
        backfaceVisibility: "hidden",
        transition: "transform .28s cubic-bezier(.2,.7,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

// Native text selection is per-DOM: dragging in one eye's copy paints
// ::selection in THAT panel only, so the eyes disagree and the highlight won't
// fuse. Same problem as the pointer, same fix — suppress the browser's own
// selection paint and re-draw it ourselves from the shared store, so both eyes
// show the identical highlight. Wrap a single text block in <Selectable id>: a
// selection inside it is measured relative to the block, and because that block
// is a fronto-parallel plane, each eye's perspective projects our rectangles
// exactly the way it projects the text — no per-eye math needed.
type SelRect = { x: number; y: number; w: number; h: number };

export function Selectable({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useShared<SelRect[]>(`sel:${id}`, []);

  useEffect(() => {
    const handle = () => {
      const el = ref.current;
      if (!el) return;
      const sel = window.getSelection();
      // Empty selection → clear. Both eyes' handlers run; the write is idempotent.
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setRects((prev) => (prev.length ? [] : prev));
        return;
      }
      // Only the block that actually holds the selection writes; the other eye's
      // copy sees a selection outside itself and leaves the shared value alone,
      // so the two handlers never race over the one store.
      const mine = el.contains(sel.anchorNode) && el.contains(sel.focusNode);
      if (!mine) return;
      const base = el.getBoundingClientRect();
      const next = Array.from(sel.getRangeAt(0).getClientRects())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({
          x: r.left - base.left,
          y: r.top - base.top,
          w: r.width,
          h: r.height,
        }));
      setRects(next);
    };
    document.addEventListener("selectionchange", handle);
    return () => document.removeEventListener("selectionchange", handle);
    // store dispatch + key are stable; ref is read live inside the handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // Kill the browser's one-eye selection paint; we render our own below.
        "relative selection:bg-transparent selection:text-inherit",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {rects.map((r, i) => (
          <div
            key={i}
            className="absolute rounded-[1px] bg-white/25"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          />
        ))}
      </div>
      {/* Text sits above the highlight, exactly like a real ::selection. */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

// What we draw where the pointer is. "pointer" is the literal arrow sprite;
// "focus" is a soft radial shade — a spot of attention rather than a cursor,
// which reads better in a skeuomorphic scene where an arrow breaks the illusion.
export type CursorVariant = "pointer" | "focus";

// The depth (in abstract z-units, before the Depth control's scale) at which the
// synthetic cursor is drawn. It's the frontmost thing in every scene, so nothing
// interactive should ever be placed at or past it — scenes that stack their own
// geometry forward (e.g. the cascading DropdownMenu) clamp themselves below this.
export const CURSOR_Z = 64;

// Control-bar defaults; double-clicking a slider returns to these.
const SEPARATION_DEFAULT = 62;
const DEPTH_DEFAULT = 1;

// A synthetic pointer, drawn into each panel from the store. It lives inside the
// perspective viewport with its own translateZ, so it fuses with proper depth.
// Either way it sits on the same front plane (CURSOR_Z) — the frontmost thing in
// the scene — so nothing interactive ever pops in front of it (see the post's note).
function StereoCursor({ variant }: { variant: CursorVariant }) {
  const { state } = useContext(StoreContext);
  const scale = useContext(DepthContext);
  const pointer = state.pointer as { x: number; y: number } | null | undefined;
  if (!pointer) return null;

  if (variant === "focus") {
    const SIZE = 64;
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-50 rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          transform: `translate3d(${pointer.x - SIZE / 2}px, ${pointer.y - SIZE / 2}px, ${CURSOR_Z * scale}px)`,
          background:
            "radial-gradient(circle, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
    );
  }

  // Over something clickable (see useHand) the arrow becomes a pointing hand —
  // the same shared flag in both eyes, so the fused cursor changes shape as one.
  if (state.hand) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-50"
        style={{
          transform: `translate3d(${pointer.x - 8.5}px, ${pointer.y - 1}px, ${CURSOR_Z * scale}px)`,
        }}
      >
        <svg width="19" height="21" viewBox="0 0 19 21" fill="none">
          <path
            d="M7 1.5c0-.8.7-1.5 1.5-1.5S10 .7 10 1.5V9h1V5.5c0-.8.7-1.5 1.5-1.5S14 4.7 14 5.5V9.5h1V7c0-.8.7-1.5 1.5-1.5S18 6.2 18 7v5.5c0 3.6-2.9 6.5-6.5 6.5h-1.2c-2 0-3.8-.9-5-2.5L2.6 13c-.5-.7-.4-1.7.3-2.2.7-.5 1.7-.4 2.2.3L7 13V1.5z"
            className="fill-white"
            stroke="black"
            strokeOpacity="0.45"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-50"
      style={{
        transform: `translate3d(${pointer.x}px, ${pointer.y}px, ${CURSOR_Z * scale}px)`,
      }}
    >
      <svg width="15" height="19" viewBox="0 0 15 19" fill="none">
        <path
          d="M1 1L1 14.5L4.7 11.1L7.3 17L9.7 15.9L7 10.2L11.7 9.8L1 1Z"
          className="fill-white"
          stroke="black"
          strokeOpacity="0.4"
          strokeWidth="0.9"
        />
      </svg>
    </div>
  );
}

function Panel({
  store,
  origin,
  showCursor,
  cursor,
  showDots,
  overlay,
  children,
}: {
  store: Store;
  origin: string;
  showCursor: boolean;
  cursor: CursorVariant;
  showDots: boolean;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <StoreContext.Provider value={store}>
      <div
        // overflow-hidden: nothing one eye draws may ever spill into the other
        // panel — an oversized plane leaking across the divider shows up as a
        // band in one eye only, which the other eye can't fuse.
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ perspective: "1400px", perspectiveOrigin: origin }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          store.set((s) => ({
            ...s,
            pointer: { x: e.clientX - r.left, y: e.clientY - r.top },
          }));
        }}
        onPointerLeave={() => store.set((s) => ({ ...s, pointer: null }))}
      >
        {showDots && (
          <div className="absolute left-1/2 top-4 size-2 -translate-x-1/2 rounded-full bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
        )}
        {children}
        {/* Scene-provided overlay — a DIRECT child of the panel, so it shares the
            panel's coordinate space and can be anchored to the panel-local
            pointer (the scene content is centered and can't do that). */}
        {overlay}
        {showCursor && <StereoCursor variant={cursor} />}
      </div>
    </StoreContext.Provider>
  );
}

// A minimal iOS-style slider: a full track with a progress fill and no handle,
// thickening while dragged. Pulling past an end rubber-bands the bar slightly in
// that direction and it springs back on release. The pointer→value mapping reads
// a STABLE (untransformed) box, while the stretch scales an inner overlay only —
// so the stretch never feeds back into the geometry or shifts the layout.
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  tall = false,
  notch,
  defaultValue,
  labelClassName,
}: {
  label: string;
  /** Extra classes for the label/value row beneath the track. */
  labelClassName?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  /** A chunkier, squared-off (rounded-lg) track. */
  tall?: boolean;
  /** A value to mark with a small tick on the track — a "sweet spot". */
  notch?: number;
  /** Double-click the track to snap back to this. */
  defaultValue?: number;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  // Signed px of over-pull past an end (negative = min side, positive = max).
  const [stretch, setStretch] = useState(0);
  // Which end is being over-pulled. Kept SEPARATE from `stretch` so it survives
  // the release: the bar springs back anchored to the same end it stretched
  // from, instead of the origin flipping the instant stretch hits 0.
  const [side, setSide] = useState<"min" | "max">("max");
  // The last continuous position under the pointer, snapped to a step on release.
  const lastFrac = useRef(0);
  // Track width in px, so the stretch can be an absolute overhang (see scaleX).
  const trackW = useRef(1);

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const notchPct =
    notch === undefined ? null : Math.max(0, Math.min(1, (notch - min) / (max - min)));
  const radius = tall ? "rounded-lg" : "rounded-full";

  const update = (clientX: number) => {
    const el = measureRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const raw = (clientX - r.left) / r.width;
    const clamped = Math.max(0, Math.min(1, raw));
    trackW.current = r.width;
    // While dragging the value follows the pointer CONTINUOUSLY, so the fill
    // glides instead of ticking from step to step; it snaps on release.
    lastFrac.current = clamped;
    onChange(min + clamped * (max - min));
    const over = raw < 0 ? raw * r.width : raw > 1 ? (raw - 1) * r.width : 0;
    if (over !== 0) setSide(over < 0 ? "min" : "max");
    setStretch(Math.max(-8, Math.min(8, over * 0.2)));
  };

  const release = () => {
    setDragging(false);
    setStretch(0);
    // Snap to the nearest step (rounded to the step's precision, so 0.1 + 0.2
    // style float noise never reaches the consumer).
    const v = min + lastFrac.current * (max - min);
    const decimals = (String(step).split(".")[1] ?? "").length;
    const snapped = Number((Math.round(v / step) * step).toFixed(decimals));
    onChange(Math.max(min, Math.min(max, snapped)));
  };

  // `stretch` is the overhang in PX: scaling by stretch/width makes the bar
  // extend exactly that far past its end regardless of how wide the track is —
  // a wide track no longer stretches further than a narrow one, so it can never
  // reach its container's edge (max 8px, inside any padding we use).
  const scaleX = 1 + Math.abs(stretch) / Math.max(1, trackW.current);

  return (
    <label className="flex min-w-[150px] flex-1 select-none flex-col gap-1">
      <div
        className="relative flex h-6 cursor-ew-resize items-center [touch-action:none]"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          update(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging) update(e.clientX);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        // Double-click resets. The two clicks have already scrubbed the value
        // (harmless); this lands last, and the fill eases to the default since
        // we're no longer dragging.
        onDoubleClick={() => {
          if (defaultValue !== undefined) onChange(defaultValue);
        }}
      >
        {/* Stable box: width/left never change, so the value mapping is steady. */}
        <div ref={measureRef} className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center">
            {/* Stretch overlay: transform only — no reflow, no layout shift. */}
            <div
              className="w-full transition-transform duration-300 [transition-timing-function:cubic-bezier(.2,1.15,.45,1)]"
              style={{
                transform: `scaleX(${scaleX})`,
                // Over-pulling the min end grows the bar leftward (anchored at
                // its right edge) and vice versa — and, via `side`, springs back
                // from that same edge.
                transformOrigin: side === "min" ? "right center" : "left center",
              }}
            >
              <div
                className={cn(
                  "relative w-full bg-neutral-700/50 transition-[height] duration-200",
                  radius,
                  tall ? (dragging ? "h-7" : "h-6") : dragging ? "h-3.5" : "h-3",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-neutral-200",
                    radius,
                    // Track the pointer directly while dragging; ease into the
                    // snapped step on release.
                    !dragging && "transition-[width] duration-200 ease-out",
                  )}
                  style={{ width: `${pct * 100}%` }}
                />
                {notchPct !== null && (
                  <>
                    {/* tick through the track (reads on the light fill) … */}
                    <div
                      className="absolute inset-y-1 w-px -translate-x-1/2 bg-neutral-950/60"
                      style={{ left: `${notchPct * 100}%` }}
                    />
                    {/* … and a small marker beneath it, always visible */}
                    <div
                      className="absolute top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[5px] border-x-transparent border-b-neutral-500"
                      style={{ left: `${notchPct * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className={cn("flex justify-between text-xs text-neutral-500", labelClassName)}>
        <span>{label}</span>
        <span className="tabular-nums text-neutral-300">{format(value)}</span>
      </span>
    </label>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Same language as WiggleStereo's controls (snappy colors, a slight dip
        // on press), in a pill.
        "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-medium",
        "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]",
        active
          ? "border-neutral-600 bg-neutral-700 text-neutral-100"
          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The engine. Renders `children` as a stereo pair. `enableSync` decides whether
 * the two eyes share interaction state (seamless) or not (flickery);
 * `showControls` reveals the bottom control bar.
 */
export function StereoScene({
  children,
  overlay,
  enableSync = false,
  showControls = false,
  height = 360,
  cursor = "pointer",
  originY = "50%",
}: {
  children: ReactNode;
  /** Rendered as a direct child of each panel (pointer-anchored drag layers etc.). */
  overlay?: ReactNode;
  enableSync?: boolean;
  showControls?: boolean;
  height?: number;
  /** How the synthetic pointer is drawn — an arrow, or a soft focus shade. */
  cursor?: CursorVariant;
  /** Vertical eye height. Both eyes share it (only X differs), so raising the
      camera above 50% lets you look down onto tilted surfaces without breaking
      the horizontal-disparity fusion. */
  originY?: string;
}) {
  // All three stores always exist (stable hook order); which each panel reads
  // is chosen below. Synced → both read `shared`; unsynced → separate.
  const shared = useState<Bag>(INITIAL);
  const leftOwn = useState<Bag>(INITIAL);
  const rightOwn = useState<Bag>(INITIAL);

  // A longer perspective (1400px) foreshortens gently, so elements are magnified
  // less and stay sharp; the larger separation keeps the fused depth the same.
  const [separation, setSeparation] = useState(SEPARATION_DEFAULT);
  const [depth, setDepth] = useState(DEPTH_DEFAULT);
  const [dots, setDots] = useState(true);
  // Cross-eyed viewing is the technique the post teaches; the toggle is gone but
  // the geometry stays fixed to it.
  const cross = true;

  // A press can end anywhere; clear it globally on pointer release.
  useEffect(() => {
    const clear = () =>
      [shared[1], leftOwn[1], rightOwn[1]].forEach((set) =>
        set((s) => (s.pressed ? { ...s, pressed: null } : s)),
      );
    window.addEventListener("pointerup", clear);
    return () => window.removeEventListener("pointerup", clear);
    // dispatch identities are stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toStore = ([state, dispatch]: [
    Bag,
    Dispatch<SetStateAction<Bag>>,
  ]): Store => ({ state, set: (u) => dispatch(u) });

  const leftStore = toStore(enableSync ? shared : leftOwn);
  const rightStore = toStore(enableSync ? shared : rightOwn);

  // Cross-eye: the left panel is seen by the right eye, so its viewpoint sits to
  // the right (origin > 50%). Parallel viewing flips it.
  const s = cross ? 1 : -1;
  const leftOrigin = `calc(50% + ${s * separation}px) ${originY}`;
  const rightOrigin = `calc(50% - ${s * separation}px) ${originY}`;

  return (
    <DepthContext.Provider value={depth}>
      <WritingCanvas>
        <div
          style={{ height }}
          className={cn(
            "relative flex overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950",
            // When synced, our synthetic cursor is the only pointer — hide the
            // native one everywhere, including over inputs/buttons that would
            // otherwise force their own text/pointer cursor on top of ours.
            enableSync && "cursor-none [&_*]:cursor-none",
          )}
        >
          <Panel
            store={leftStore}
            origin={leftOrigin}
            showCursor={enableSync}
            cursor={cursor}
            showDots={dots}
            overlay={overlay}
          >
            {children}
          </Panel>
          <div className="w-px shrink-0 bg-neutral-800/70" />
          <Panel
            store={rightStore}
            origin={rightOrigin}
            showCursor={enableSync}
            cursor={cursor}
            showDots={dots}
            overlay={overlay}
          >
            {children}
          </Panel>
        </div>

        {showControls && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
            <Slider
              label="Eye separation"
              value={separation}
              min={0}
              max={140}
              step={1}
              onChange={setSeparation}
              defaultValue={SEPARATION_DEFAULT}
              format={(v) => `${v.toFixed(0)}px`}
            />
            <Slider
              label="Depth"
              value={depth}
              min={0}
              max={2}
              step={0.05}
              onChange={setDepth}
              defaultValue={DEPTH_DEFAULT}
              format={(v) => `${v.toFixed(2)}x`}
            />
            <Toggle active={dots} onClick={() => setDots((v) => !v)}>
              Guide dots
            </Toggle>
          </div>
        )}
      </WritingCanvas>
    </DepthContext.Provider>
  );
}
