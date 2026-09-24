import { Depth, StereoScene, useShared } from "./stereo/engine";
import { cn } from "../../lib/utils";

// A messy desktop where files are sorted along the z-axis by how recently they
// were opened — the closest file is the most recent. Click one to "open" it and
// it rises to the front of the stack. Depth alone tells you the recency order at
// a glance. Every file stays under the cursor's depth plane so the pointer never
// sits behind a file it visually occludes.

type FileItem = { id: string; name: string; x: number; y: number };

const FILES: FileItem[] = [
  { id: "budget", name: "budget.xlsx", x: 10, y: 16 },
  { id: "notes", name: "notes.md", x: 30, y: 30 },
  { id: "shot", name: "shot.png", x: 20, y: 58 },
  { id: "resume", name: "resume.pdf", x: 44, y: 14 },
  { id: "index", name: "index.tsx", x: 40, y: 46 },
  { id: "logo", name: "logo.svg", x: 60, y: 28 },
  { id: "todo", name: "todo.txt", x: 14, y: 78 },
  { id: "invoice", name: "invoice.pdf", x: 54, y: 64 },
  { id: "data", name: "data.json", x: 72, y: 50 },
  { id: "draft", name: "draft.docx", x: 36, y: 76 },
  { id: "readme", name: "README.md", x: 66, y: 80 },
];
const DEFAULT_RECENCY = FILES.map((f) => f.id); // index 0 = most recent
const STEP = 4.4; // px of depth between adjacent files
const MAX_Z = (FILES.length - 1) * STEP; // ~44 — safely under the cursor plane

function FileIcon() {
  return (
    <svg viewBox="0 0 32 40" className="h-9 w-9" fill="none">
      <path
        d="M6 2.5h14L27 9.5v26.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 6 2.5Z"
        className="fill-neutral-800 stroke-neutral-600"
        strokeWidth="1.5"
      />
      <path
        d="M19.5 2.6V8a1.5 1.5 0 0 0 1.5 1.5h5.4"
        className="stroke-neutral-600"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function Desktop() {
  const [recency, setRecency] = useShared<string[]>("recency", DEFAULT_RECENCY);
  const [hovered, setHovered] = useShared<string | null>("hovered", null);

  const bringToFront = (id: string) =>
    setRecency((prev) => [id, ...prev.filter((x) => x !== id)]);

  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]">
      <div className="absolute left-4 top-3 text-[11px] text-neutral-500">
        Depth = how recently opened · click to bring forward
      </div>
      {FILES.map((f) => {
        const rank = recency.indexOf(f.id); // 0 = most recent
        const z = MAX_Z - rank * STEP; // most recent = closest
        const isHovered = hovered === f.id;
        const isFront = rank === 0;
        return (
          <Depth
            key={f.id}
            z={z}
            style={{ position: "absolute", left: `${f.x}%`, top: `${f.y}%` }}
          >
            <button
              onPointerDown={() => bringToFront(f.id)}
              onPointerEnter={() => setHovered(f.id)}
              onPointerLeave={() =>
                setHovered((h) => (h === f.id ? null : h))
              }
              className={cn(
                "flex w-[84px] flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 transition-colors",
                isHovered ? "bg-white/10" : "bg-transparent",
              )}
            >
              <FileIcon />
              <span
                className={cn(
                  "max-w-full truncate text-[10.5px] leading-tight",
                  isFront || isHovered ? "text-neutral-100" : "text-neutral-400",
                )}
              >
                {f.name}
              </span>
            </button>
          </Depth>
        );
      })}
    </div>
  );
}

export function RecencyDesktop({
  enableSync = true,
  showControls = true,
}: {
  enableSync?: boolean;
  showControls?: boolean;
}) {
  return (
    <StereoScene enableSync={enableSync} showControls={showControls} height={360}>
      <Desktop />
    </StereoScene>
  );
}
