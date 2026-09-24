import { motion, AnimatePresence } from "motion/react";
import {
  StereoScene,
  useShared,
  useDepthScale,
  useHand,
  CURSOR_Z,
} from "./stereo/engine";
import { cn } from "../../lib/utils";

// A nesting dropdown with AREA-BASED stacking. Clicking an item with children
// expands a new floating window out of that very row: it opens directly on top
// of the parent, one step closer to you and a touch narrower, with its first row
// lined up with the row you clicked. The parent stays visible above and around
// it, so there's no header or "back" button — navigation is spatial. Click any
// visible item on a lower layer and focus returns to that layer (everything
// stacked above it folds away) and the click acts on that item.
//
// Open state, the open path, hover and selection are shared engine state, so the
// synced pair opens, stacks and highlights as one. The synthetic cursor becomes
// a pointing hand over anything clickable (useHand).

// Depth schedule. Each level steps FORWARD toward the viewer but the stack stays
// a clear margin BEHIND the cursor plane (CURSOR_Z): the cursor is drawn on top,
// so anything reaching it would look like it's punching through.
const MENU_BASE = 8;
const MENU_STEP = 18;
const MENU_MARGIN = 12;
const menuZ = (level: number) =>
  Math.min(MENU_BASE + level * MENU_STEP, CURSOR_Z - MENU_MARGIN);

// Every level shares one centre line; each is a little narrower than its parent
// so the parent's edges peek out beneath it and the stack reads as nested.
const MENU_W = 184;
const MENU_SHRINK = 14;
const menuW = (level: number) => MENU_W - level * MENU_SHRINK;
const MENU_TOP = 74;
// Fixed row metrics, so a child's anchor row is pure arithmetic (identical in
// both eyes) rather than something measured.
const ROW_H = 28;
const PAD = 4;
const BORDER = 1; // the window's border width (it's border-box)

type MenuItem = {
  id: string;
  label: string;
  children?: MenuItem[];
  hint?: string;
};

const MENU: MenuItem[] = [
  { id: "new", label: "New file", hint: "⌘N" },
  {
    id: "recent",
    label: "Open recent",
    children: [
      { id: "stereo", label: "stereoscopic-ui" },
      { id: "portfolio", label: "portfolio" },
      {
        id: "more",
        label: "More projects",
        children: [
          { id: "cside", label: "cside-dashboard" },
          { id: "lanyard", label: "lanyard" },
          { id: "figura", label: "figura" },
        ],
      },
    ],
  },
  {
    id: "share",
    label: "Share",
    children: [
      { id: "link", label: "Copy link" },
      { id: "email", label: "Email" },
      { id: "embed", label: "Embed" },
    ],
  },
  { id: "settings", label: "Settings", hint: "⌘," },
  { id: "delete", label: "Delete" },
];

function ChevronRight() {
  return (
    <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-neutral-500" fill="none">
      <path d="M6 3.5 10.5 8 6 12.5" className="stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Resolve the open path into a stack of levels. Each level knows its items, the
// child expanded out of it (if any), and its top edge — the root sits at
// MENU_TOP and every child is anchored to the row of the item that opened it.
function levelsFor(path: string[]) {
  const levels: { key: string; items: MenuItem[]; openId: string | null; top: number }[] = [
    { key: "root", items: MENU, openId: path[0] ?? null, top: MENU_TOP },
  ];
  let items = MENU;
  let top = MENU_TOP;
  for (let i = 0; i < path.length; i++) {
    const idx = items.findIndex((x) => x.id === path[i]);
    const found = items[idx];
    if (!found?.children) break;
    top = top + idx * ROW_H;
    items = found.children;
    levels.push({ key: found.id, items, openId: path[i + 1] ?? null, top });
  }
  return levels;
}

function Menu() {
  const [open, setOpen] = useShared<boolean>("open", true);
  const [path, setPath] = useShared<string[]>("path", ["recent"]);
  const [hovered, setHovered] = useShared<string | null>("hovered", null);
  const [selected, setSelected] = useShared<string | null>("selected", null);
  const hand = useHand();
  // Menu depths track the Depth control, exactly like the cursor, so the "behind
  // the cursor" relationship holds at every setting.
  const scale = useDepthScale();

  const levels = open ? levelsFor(path) : [];

  // Acting on level `i` brings focus back to it: everything stacked above folds
  // away, then the click does its thing on that layer.
  const clickItem = (levelIndex: number, item: MenuItem) => {
    if (item.children) {
      setPath((p) => [...p.slice(0, levelIndex), item.id]);
      setSelected(null);
    } else {
      setPath((p) => p.slice(0, levelIndex));
      setSelected(item.id);
    }
  };
  const focusLevel = (levelIndex: number) => setPath((p) => p.slice(0, levelIndex));

  const hover = (id: string) => ({
    onPointerEnter: () => {
      setHovered(id);
      hand.onPointerEnter();
    },
    onPointerLeave: () => {
      setHovered((h) => (h === id ? null : h));
      hand.onPointerLeave();
    },
  });

  return (
    <div className="absolute inset-0 flex items-start justify-center [transform-style:preserve-3d]">
      {open && (
        <div
          className="absolute inset-0 z-0"
          onPointerDown={() => {
            setOpen(false);
            setPath([]);
          }}
        />
      )}

      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          setPath([]);
        }}
        {...hover("trigger")}
        className={cn(
          "relative z-10 mt-9 flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
          open || hovered === "trigger"
            ? "border-neutral-600 bg-neutral-800 text-neutral-100"
            : "border-neutral-700 bg-neutral-900 text-neutral-300",
        )}
      >
        Actions
        <svg
          viewBox="0 0 16 16"
          className={cn(
            "size-3 text-neutral-500 transition-transform duration-200",
            open && "rotate-180",
          )}
          fill="none"
        >
          <path d="M4 6 8 10 12 6" className="stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open &&
          levels.map((level, i) => {
            const w = menuW(i);
            // A new window expands OUT of the row it was opened from: it starts
            // as a single row's height on the parent's plane (exactly over the
            // item you clicked) and grows down to the full list at its own depth.
            const fromZ = menuZ(Math.max(0, i - 1)) * scale;
            const fromScale = 0.99;
            // border-box: the animated height must include the padding AND the
            // 1px border on each side, or the last row loses 2px to the clip.
            const chrome = PAD * 2 + BORDER * 2;
            const oneRow = ROW_H + chrome;
            const fullH = level.items.length * ROW_H + chrome;
            return (
              <motion.div
                key={level.key}
                initial={{ opacity: 0, scale: fromScale, z: fromZ, height: oneRow }}
                animate={{ opacity: 1, scale: 1, z: menuZ(i) * scale, height: fullH }}
                exit={{ opacity: 0, scale: fromScale, z: fromZ, height: oneRow }}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                onPointerDown={(e) => {
                  // A click on the window's own chrome (not an item) just brings
                  // focus back to this layer.
                  e.stopPropagation();
                  focusLevel(i);
                }}
                style={{
                  width: w,
                  left: `calc(50% - ${w / 2}px)`,
                  top: level.top,
                  padding: PAD,
                  zIndex: 20 + i,
                  transformOrigin: "50% 0%",
                }}
                // overflow-hidden clips the rows while the height grows. The
                // window's children are flat, so it doesn't need preserve-3d
                // itself (which overflow would cancel) — its own translateZ only
                // needs the 3D context of the parent container.
                className="absolute overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/95 shadow-[0_22px_44px_rgba(0,0,0,0.6)] backdrop-blur-sm"
              >
                {level.items.map((item) => {
                  const isOpenSub = level.openId === item.id;
                  const isSel = selected === item.id;
                  const isHov = hovered === item.id;
                  return (
                    <button
                      key={item.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        clickItem(i, item);
                      }}
                      {...hover(item.id)}
                      style={{ height: ROW_H }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 text-left text-[11px] transition-colors",
                        isOpenSub || isSel
                          ? "bg-white/10 text-white"
                          : isHov
                            ? "bg-white/[0.06] text-neutral-100"
                            : "text-neutral-300",
                      )}
                    >
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.children ? (
                        <ChevronRight />
                      ) : item.hint ? (
                        <span className="text-[10px] tabular-nums text-neutral-600">
                          {item.hint}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}

export function DropdownMenu({
  enableSync = true,
  showControls = true,
}: {
  enableSync?: boolean;
  showControls?: boolean;
}) {
  return (
    <StereoScene enableSync={enableSync} showControls={showControls} height={360}>
      <Menu />
    </StereoScene>
  );
}
