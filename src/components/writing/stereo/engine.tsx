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
        transition: "transform .28s cubic-bezier(.2,.7,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

// A synthetic pointer, drawn into each panel from the store. It lives inside the
// perspective viewport with its own translateZ, so it fuses with proper depth.
function StereoCursor() {
  const { state } = useContext(StoreContext);
  const scale = useContext(DepthContext);
  const pointer = state.pointer as { x: number; y: number } | null | undefined;
  if (!pointer) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-50"
      style={{
        transform: `translate3d(${pointer.x}px, ${pointer.y}px, ${64 * scale}px)`,
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
  showDots,
  overlay,
  children,
}: {
  store: Store;
  origin: string;
  showCursor: boolean;
  showDots: boolean;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <StoreContext.Provider value={store}>
      <div
        className="relative flex flex-1 items-center justify-center"
        style={{ perspective: "760px", perspectiveOrigin: origin }}
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
        {showCursor && <StereoCursor />}
      </div>
    </StoreContext.Provider>
  );
}

// A minimal iOS-style slider: a full track with a progress fill and no handle,
// thickening while dragged. Pulling past an end rubber-bands the bar slightly in
// that direction and it springs back on release. The pointer→value mapping reads
// a STABLE (untransformed) box, while the stretch scales an inner overlay only —
// so the stretch never feeds back into the geometry or shifts the layout.
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  // Signed px of over-pull past an end (negative = min side, positive = max).
  const [stretch, setStretch] = useState(0);

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const update = (clientX: number) => {
    const el = measureRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const raw = (clientX - r.left) / r.width;
    const clamped = Math.max(0, Math.min(1, raw));
    const stepped = Math.round((min + clamped * (max - min)) / step) * step;
    onChange(Math.max(min, Math.min(max, stepped)));
    const over = raw < 0 ? raw * r.width : raw > 1 ? (raw - 1) * r.width : 0;
    setStretch(Math.max(-11, Math.min(11, over * 0.28)));
  };

  const scaleX = 1 + Math.abs(stretch) / 380;

  return (
    <label className="flex min-w-[150px] flex-1 select-none flex-col gap-2">
      <span className="flex justify-between text-[11px] text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-300">{format(value)}</span>
      </span>
      <div
        className="relative flex h-5 items-center [touch-action:none]"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          update(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging) update(e.clientX);
        }}
        onPointerUp={() => {
          setDragging(false);
          setStretch(0);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setStretch(0);
        }}
      >
        {/* Stable box: width/left never change, so the value mapping is steady. */}
        <div ref={measureRef} className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center">
            {/* Stretch overlay: transform only — no reflow, no layout shift. */}
            <div
              className="w-full transition-transform duration-300 [transition-timing-function:cubic-bezier(.2,1.35,.45,1)]"
              style={{
                transform: `scaleX(${scaleX})`,
                transformOrigin: stretch >= 0 ? "left center" : "right center",
              }}
            >
              <div
                className={cn(
                  "relative w-full rounded-full bg-neutral-700/50 transition-[height] duration-200",
                  dragging ? "h-2" : "h-1.5",
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-neutral-200"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
        "shrink-0 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-neutral-600 bg-neutral-800 text-neutral-100"
          : "border-neutral-800 text-neutral-500 hover:text-neutral-300",
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
}: {
  children: ReactNode;
  /** Rendered as a direct child of each panel (pointer-anchored drag layers etc.). */
  overlay?: ReactNode;
  enableSync?: boolean;
  showControls?: boolean;
  height?: number;
}) {
  // All three stores always exist (stable hook order); which each panel reads
  // is chosen below. Synced → both read `shared`; unsynced → separate.
  const shared = useState<Bag>(INITIAL);
  const leftOwn = useState<Bag>(INITIAL);
  const rightOwn = useState<Bag>(INITIAL);

  const [separation, setSeparation] = useState(34);
  const [depth, setDepth] = useState(1);
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
  const leftOrigin = `calc(50% + ${s * separation}px) 50%`;
  const rightOrigin = `calc(50% - ${s * separation}px) 50%`;

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
              max={80}
              step={1}
              onChange={setSeparation}
              format={(v) => `${v.toFixed(0)}px`}
            />
            <Slider
              label="Depth"
              value={depth}
              min={0}
              max={2}
              step={0.05}
              onChange={setDepth}
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
