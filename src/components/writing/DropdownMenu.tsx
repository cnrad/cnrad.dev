import { motion, AnimatePresence } from "motion/react";
import { StereoScene, useShared } from "./stereo/engine";
import { cn } from "../../lib/utils";

// A cascading dropdown. Opening a submenu spawns a NEW floating window stacked
// FORWARD in depth and offset from its parent — nested menus made literal in z.
// The windows float above the content (absolute, nothing shifts) and scale in at
// full size, so there's no grow-into-place. Open state, the open path, hover and
// selection are shared engine state, so the synced pair opens and highlights as
// one.

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

// Resolve the open path into a stack of levels, each with its item list, the
// child that's currently expanded (if any), and a stable key for animation.
function levelsFor(path: string[]) {
  const levels: { key: string; items: MenuItem[]; openId: string | null }[] = [
    { key: "root", items: MENU, openId: path[0] ?? null },
  ];
  let items = MENU;
  for (let i = 0; i < path.length; i++) {
    const found = items.find((x) => x.id === path[i]);
    if (!found?.children) break;
    items = found.children;
    levels.push({ key: found.id, items, openId: path[i + 1] ?? null });
  }
  return levels;
}

function Menu() {
  const [open, setOpen] = useShared<boolean>("open", true);
  const [path, setPath] = useShared<string[]>("path", ["recent"]);
  const [hovered, setHovered] = useShared<string | null>("hovered", null);
  const [selected, setSelected] = useShared<string | null>("selected", null);

  const levels = open ? levelsFor(path) : [];

  const clickItem = (levelIndex: number, item: MenuItem) => {
    if (item.children) {
      setPath((p) =>
        p[levelIndex] === item.id
          ? p.slice(0, levelIndex) // toggle closed
          : [...p.slice(0, levelIndex), item.id],
      );
      setSelected(null);
    } else {
      setSelected(item.id);
    }
  };

  const enter = (id: string) => setHovered(id);
  const leave = (id: string) =>
    setHovered((h) => (h === id ? null : h));

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
        onPointerEnter={() => enter("trigger")}
        onPointerLeave={() => leave("trigger")}
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
          levels.map((level, i) => (
            <motion.div
              key={level.key}
              initial={{ opacity: 0, scale: 0.92, z: 20 + i * 44 - 14 }}
              animate={{ opacity: 1, scale: 1, z: 20 + i * 44 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              style={{
                left: `calc(50% - 84px + ${i * 42}px)`,
                top: `${74 + i * 28}px`,
                zIndex: 20 + i,
              }}
              className="absolute w-[168px] rounded-xl border border-neutral-700 bg-neutral-900/95 p-1 shadow-[0_26px_50px_rgba(0,0,0,0.6)] backdrop-blur-sm [transform-style:preserve-3d]"
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
                    onPointerEnter={() => enter(item.id)}
                    onPointerLeave={() => leave(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
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
          ))}
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
