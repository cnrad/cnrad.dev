import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StereoScene, useShared } from "./stereo/engine";
import { cn } from "../../lib/utils";

// Drag any chip to reorder. Grabbing a chip lifts a clone that starts exactly on
// it and tracks the cursor 1:1, while an invisible placeholder holds the slot and
// the rest reflow via motion's layout animation. On release the clone springs to
// the placeholder's slot AND drops back down (z → 0), then the real chip takes
// over — an actual landing, no fade. Hover, order, dragged id, grab offset,
// pointer and the drop target are shared engine state, so the synced pair drags,
// hovers and lands as one.

const ITEMS = [
  "Overview",
  "Activity",
  "Billing",
  "Members",
  "API keys",
  "Webhooks",
  "Domains",
  "Usage",
  "Security",
];
const DEFAULT_ORDER = ITEMS.map((_, i) => String(i));
const LABEL = Object.fromEntries(ITEMS.map((label, i) => [String(i), label]));

const CHIP =
  "touch-none select-none rounded-full border px-3 py-1.5 text-xs whitespace-nowrap";

type Point = { x: number; y: number };

function Chips() {
  const [order, setOrder] = useShared<string[]>("order", DEFAULT_ORDER);
  const [dragging, setDragging] = useShared<string | null>("dragging", null);
  const [hovered, setHovered] = useShared<string | null>("hovered", null);
  const [grab, setGrab] = useShared<Point>("grab", { x: 0, y: 0 });
  const [pointer] = useShared<Point | null>("pointer", null);
  const [drop, setDrop] = useShared<Point | null>("drop", null);

  // The scene root fills the panel, so its coordinate space matches the
  // engine's panel-local pointer — the clone and the measured slot line up.
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLButtonElement | null>(null);
  const draggingRef = useRef<string | null>(null);
  draggingRef.current = dragging;
  const dropRef = useRef<Point | null>(null);
  dropRef.current = drop;
  // Keep the last real pointer so the clone doesn't blink if the pointer briefly
  // leaves the panel mid-drag.
  const lastPointer = useRef<Point>({ x: 0, y: 0 });
  if (pointer) lastPointer.current = pointer;

  // On release, measure where the placeholder ended up and hand the clone a slot
  // to fly to (panel-local). The clone animates there, then finishDrop swaps in
  // the real chip.
  useEffect(() => {
    const onUp = () => {
      if (!draggingRef.current) return;
      const root = rootRef.current;
      const ph = placeholderRef.current;
      if (root && ph) {
        const rr = root.getBoundingClientRect();
        const pr = ph.getBoundingClientRect();
        setDrop({ x: pr.left - rr.left, y: pr.top - rr.top });
      } else {
        setDragging(null);
      }
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
    // stable dispatches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reorder from the CURSOR's geometry, not from pills entering it. pointermove
  // only fires when the pointer actually moves, so reflowing pills can't retrigger
  // it — that's what kills the ping-pong. We compute a reading-order insertion
  // index (how many pills the cursor sits past) and only commit when it changes.
  const reorderFromPointer = (clientX: number, clientY: number) => {
    const id = draggingRef.current;
    if (!id || dropRef.current) return;
    const list = listRef.current;
    if (!list) return;
    let before = 0;
    list.querySelectorAll<HTMLElement>("[data-pill]").forEach((el) => {
      if (el.dataset.pill === id) return; // skip the placeholder
      const r = el.getBoundingClientRect();
      if (clientY > r.bottom) before++; // cursor is in a lower row → past this pill
      else if (clientY >= r.top && clientX > r.left + r.width / 2) before++; // same row, right of center
    });
    setOrder((prev) => {
      const without = prev.filter((x) => x !== id);
      const idx = Math.max(0, Math.min(without.length, before));
      without.splice(idx, 0, id);
      const same =
        without.length === prev.length &&
        without.every((v, i) => v === prev[i]);
      return same ? prev : without;
    });
  };

  const finishDrop = () => {
    setDragging(null);
    setDrop(null);
    setHovered(null);
  };

  const p = pointer ?? lastPointer.current;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
    >
      <div className="[transform-style:preserve-3d]">
        <div className="mb-3 text-center text-[11px] text-neutral-500">
          Drag to reorder
        </div>
        <div
          ref={listRef}
          className="mx-auto flex w-[290px] flex-wrap content-start justify-center gap-2 [transform-style:preserve-3d]"
          onPointerMove={(e) => {
            if (dragging) reorderFromPointer(e.clientX, e.clientY);
          }}
        >
          {order.map((id) => {
            const isDragging = dragging === id;
            return (
              <motion.button
                key={id}
                layout
                data-pill={id}
                ref={isDragging ? placeholderRef : undefined}
                transition={{ type: "spring", stiffness: 700, damping: 46 }}
                // While any pill is being dragged, pills ignore the pointer so
                // moving pills can't fire enter/leave — the container's
                // pointermove is the single source of reorder truth.
                style={{ pointerEvents: dragging ? "none" : undefined }}
                onPointerDown={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setGrab({ x: e.clientX - r.left, y: e.clientY - r.top });
                  setHovered(id);
                  setDragging(id);
                }}
                onPointerEnter={() => setHovered(id)}
                onPointerLeave={() => setHovered((h) => (h === id ? null : h))}
                className={cn(
                  CHIP,
                  isDragging
                    ? "border-neutral-700 bg-neutral-800 text-neutral-300 opacity-0"
                    : !dragging && hovered === id
                      ? "border-neutral-600 bg-neutral-700/70 text-neutral-100"
                      : "border-neutral-700 bg-neutral-800 text-neutral-300",
                )}
              >
                {LABEL[id]}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Floating clone — tracks the cursor, then springs to the slot and lands. */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            key="clone"
            className="pointer-events-none absolute left-0 top-0 z-30"
            animate={{
              x: drop ? drop.x : p.x - grab.x,
              y: drop ? drop.y : p.y - grab.y,
              z: drop ? 0 : 46,
              scale: drop ? 1 : 1.06,
            }}
            transition={
              drop
                ? { type: "spring", stiffness: 600, damping: 38 }
                : {
                    x: { duration: 0 },
                    y: { duration: 0 },
                    z: { type: "spring", stiffness: 520, damping: 36 },
                    scale: { type: "spring", stiffness: 520, damping: 36 },
                  }
            }
            onAnimationComplete={() => {
              if (dropRef.current) finishDrop();
            }}
          >
            <div
              className={cn(
                CHIP,
                "border-neutral-500 bg-neutral-700 text-white",
              )}
            >
              {LABEL[dragging]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DragReorder({
  enableSync = true,
  showControls = true,
}: {
  enableSync?: boolean;
  showControls?: boolean;
}) {
  return (
    <StereoScene enableSync={enableSync} showControls={showControls} height={300}>
      <Chips />
    </StereoScene>
  );
}
