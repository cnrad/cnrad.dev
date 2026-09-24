import { motion } from "motion/react";
import { StereoScene, useControl, useDepthScale, useShared } from "./stereo/engine";
import { cn } from "../../lib/utils";

// The iOS 5 Newsstand, recreated as a stereo pair. The original faked its depth
// with paint — wood grain, a bright lip highlight, a shadow under each shelf.
// Here every shelf is real geometry in the panel's 3D space: a recessed back
// wall, inset side walls, a deck that tilts back under the covers and a flat
// front board they tuck behind, all under the "Newsstand" title board with its
// Store button, sitting over the frosted springboard. The camera is a little
// above centre so you look down onto the decks, like the original artwork.
//
// Covers rest at the opening, lift on hover, and on click the SAME cover springs
// off the shelf into a centred close-up (click again, or the backdrop, to set it
// back). Their contact shadow stays behind on the deck as they lift.

// --- Covers -----------------------------------------------------------------
// Each cover is built from CSS in one of four archetypes: a broadsheet
// newspaper, a full-bleed photo magazine, a boxed-letter masthead, or an
// illustrated literary cover.

type MagBase = { id: string; w: number; h: number; isNew?: boolean };
type Mag = MagBase &
  (
    | {
        kind: "news";
        masthead: string;
        blackletter?: boolean;
        mastColor: string;
        band?: string; // tinted masthead band (the guardian-style)
        photo: string;
      }
    | {
        kind: "photo";
        art: string;
        frame?: string; // coloured border (the yellow-frame nature title)
        masthead: string[]; // lines
        mastClass: string;
        mastColor: string;
        line?: string;
        lineColor?: string;
        band?: string;
      }
    | {
        kind: "boxed";
        bg: string;
        letters: string;
        letterColor: string;
        lines: string[];
      }
    | { kind: "illus"; masthead: string }
  );

const MAGS: Mag[][] = [
  [
    {
      id: "chronicle",
      kind: "news",
      w: 80,
      h: 64,
      masthead: "The Chronicle",
      blackletter: true,
      mastColor: "#141414",
      photo: "linear-gradient(160deg,#8a949c,#3e464c)",
    },
    {
      id: "x360",
      kind: "photo",
      w: 62,
      h: 84,
      art: "linear-gradient(168deg,#0b0e0b 0%,#15361a 44%,#61e33c 45%,#2c8f22 100%)",
      masthead: ["X360"],
      mastClass: "text-[17px] font-black italic tracking-tighter",
      mastColor: "#ffffff",
      line: "Year's best",
      lineColor: "#f4e34a",
    },
    {
      id: "explorer",
      kind: "photo",
      w: 62,
      h: 84,
      frame: "#f3c400",
      art: "linear-gradient(180deg,#2c7078 0%,#103c46 58%,#08242b 100%)",
      masthead: ["EXPLORER"],
      mastClass: "text-[8px] font-bold tracking-[0.12em]",
      mastColor: "#ffffff",
      line: "Lost cities",
      lineColor: "rgba(255,255,255,0.9)",
    },
  ],
  [
    {
      id: "daily",
      kind: "photo",
      w: 62,
      h: 84,
      art: "linear-gradient(180deg,#65768a 0%,#2b3745 56%,#131920 100%)",
      masthead: ["The Daily"],
      mastClass: "font-serif text-[13px] font-bold",
      mastColor: "#ffffff",
      band: "#c8232c",
      line: "The long game",
      lineColor: "rgba(255,255,255,0.9)",
    },
    { id: "reviewer", kind: "illus", w: 62, h: 84, masthead: "THE REVIEWER" },
    {
      id: "wire",
      kind: "boxed",
      w: 62,
      h: 84,
      isNew: true,
      bg: "linear-gradient(180deg,#d6222f,#a8151f)",
      letters: "WIRE",
      letterColor: "#cf1f2b",
      lines: ["REVERSE", "EVOLUTION"],
    },
  ],
  [
    {
      id: "times",
      kind: "news",
      w: 80,
      h: 64,
      masthead: "The Times",
      blackletter: true,
      mastColor: "#141414",
      photo: "linear-gradient(160deg,#bda78e,#6d5a45)",
    },
    {
      id: "popsci",
      kind: "photo",
      w: 62,
      h: 84,
      art: "linear-gradient(180deg,#102040 0%,#0a1428 60%,#060c18 100%)",
      masthead: ["POPULAR", "SCIENCE"],
      mastClass: "text-[10px] font-black leading-[1.05] tracking-tight",
      mastColor: "#ffffff",
      band: "#37c2d6",
      line: "Alien life",
      lineColor: "rgba(255,255,255,0.85)",
    },
    {
      id: "guardian",
      kind: "news",
      w: 80,
      h: 64,
      masthead: "theguardian",
      mastColor: "#1c5fa8",
      band: "#dbe7f4",
      photo: "linear-gradient(160deg,#8fadcc,#3d5a7a)",
    },
  ],
];

// --- Layout (px). The shelf fills the panel; rows are centred, so a cover's
// rest position follows from its row/column and both eyes derive the identical
// "pick up" offset with no measuring.
const SCENE_H = 440;
const TITLE_H = 34;
const BAY_H = 118;
const LIP_H = 12;
const BOTTOM_PAD = 8; // wood frame under the last shelf
const GAP = 14;
const RECESS = 44;
const LIP_Z = 12;
const CASE_H = TITLE_H + MAGS.length * BAY_H + BOTTOM_PAD;

function slotCenterX(row: number, col: number) {
  const ws = (MAGS[row] ?? []).map((m) => m.w);
  const total = ws.reduce((a, b) => a + b, 0) + GAP * (ws.length - 1);
  let x = -total / 2;
  for (let i = 0; i < col; i++) x += (ws[i] ?? 0) + GAP;
  return x + (ws[col] ?? 0) / 2;
}
const coverCenterY = (row: number, h: number) =>
  TITLE_H + row * BAY_H + (BAY_H - LIP_H) - h / 2;

const REST_SHADOW = "0 3px 5px rgba(0,0,0,0.35)";
const HOVER_SHADOW = "0 12px 18px rgba(0,0,0,0.45)";
const FOCUS_SHADOW = "0 10px 16px rgba(0,0,0,0.38)"; // pre-scale (×2.2)

// --- Blonde maple. Fine vertical grain over a warm gradient; each face layers
// its own light and shadow so the cabinet reads as lit from the front.
const grain = (a: string, b: string) =>
  `repeating-linear-gradient(90deg,rgba(120,80,35,0.05) 0px,rgba(120,80,35,0.05) 1px,transparent 1px,transparent 4px),` +
  `repeating-linear-gradient(90deg,rgba(255,244,218,0.06) 0px,rgba(255,244,218,0.06) 1px,transparent 1px,transparent 11px),` +
  `linear-gradient(180deg,${a},${b})`;

const TITLE_WOOD = grain("#ecd3a0", "#dcbd86");
const BACK_WOOD =
  "linear-gradient(180deg,rgba(0,0,0,0.26),rgba(0,0,0,0.03) 55%,rgba(0,0,0,0.10))," +
  grain("#cfae76", "#c09d66");
const SIDE_L_WOOD =
  "linear-gradient(90deg,rgba(0,0,0,0.38),rgba(0,0,0,0.04))," + grain("#c8a56d", "#b8955d");
const SIDE_R_WOOD =
  "linear-gradient(90deg,rgba(0,0,0,0.04),rgba(0,0,0,0.38))," + grain("#c8a56d", "#b8955d");
const CEIL_WOOD =
  "linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.30))," + grain("#8f6c3d", "#7c5c32");
const DECK_WOOD =
  "linear-gradient(180deg,rgba(0,0,0,0.20),rgba(255,248,226,0.18))," +
  grain("#e0c088", "#cfae74");
const LIP_WOOD = grain("#efd7a3", "#dbbb81");

// Faint newspaper column text.
const TEXT_LINES =
  "repeating-linear-gradient(180deg,rgba(0,0,0,0.22) 0px,rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)";

function NewsArt({ mag }: { mag: Extract<Mag, { kind: "news" }> }) {
  return (
    <div className="flex h-full w-full flex-col bg-[#f7f5ef] p-[3px]">
      <div
        className={cn(
          "text-center leading-none",
          mag.blackletter
            ? "font-serif text-[9.5px] font-black tracking-tighter"
            : "text-[9px] font-extrabold tracking-tight",
        )}
        style={{
          color: mag.mastColor,
          background: mag.band,
          padding: mag.band ? "2px 0" : 0,
          borderRadius: 1,
        }}
      >
        {mag.masthead}
      </div>
      <div className="my-[2px] h-px bg-black/60" />
      <div className="flex flex-1 gap-[3px]">
        <div className="w-[38%] rounded-[1px]" style={{ background: mag.photo }} />
        <div className="flex-1" style={{ backgroundImage: TEXT_LINES }} />
        <div className="flex-1" style={{ backgroundImage: TEXT_LINES }} />
      </div>
    </div>
  );
}

function PhotoArt({ mag }: { mag: Extract<Mag, { kind: "photo" }> }) {
  return (
    <div
      className="relative h-full w-full"
      style={{ background: mag.frame ?? "transparent", padding: mag.frame ? 3 : 0 }}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: mag.art }}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0))" }}
        />
        <div
          className={cn("absolute inset-x-1 top-1.5 text-center", mag.mastClass)}
          style={{ color: mag.mastColor, textShadow: "0 1px 1px rgba(0,0,0,0.4)" }}
        >
          {mag.masthead.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        {mag.band && (
          <div className="absolute inset-x-0 top-[38%] h-[3px]" style={{ background: mag.band }} />
        )}
        {mag.line && (
          <div
            className="absolute inset-x-1 bottom-1.5 truncate text-center text-[6.5px] font-semibold"
            style={{ color: mag.lineColor }}
          >
            {mag.line}
          </div>
        )}
      </div>
    </div>
  );
}

function BoxedArt({ mag }: { mag: Extract<Mag, { kind: "boxed" }> }) {
  return (
    <div className="relative flex h-full w-full flex-col p-1.5" style={{ background: mag.bg }}>
      <div className="flex gap-[2px]">
        {mag.letters.split("").map((ch, i) => (
          <span
            key={i}
            className="flex h-[13px] flex-1 items-center justify-center rounded-[1px] bg-white text-[10px] font-black leading-none"
            style={{ color: mag.letterColor }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="mt-auto text-[8px] font-black leading-[1.05] text-white">
        {mag.lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function IllusArt({ mag }: { mag: Extract<Mag, { kind: "illus" }> }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4efe2] p-[3px]">
      <div className="h-px bg-black/70" />
      <div className="my-[2px] text-center font-serif text-[7px] font-bold tracking-[0.14em] text-[#1a1a1a]">
        {mag.masthead}
      </div>
      <div className="h-px bg-black/70" />
      {/* a spare, painterly illustration */}
      <div className="relative flex-1">
        <div className="absolute left-1 top-3 size-8 rounded-full bg-[#6a8fb5]/80" />
        <div className="absolute right-1 top-6 size-6 rounded-full bg-[#d9a441]/85" />
        <div className="absolute inset-x-1 bottom-1 h-3 rounded-t-full bg-[#4d7a52]/80" />
      </div>
    </div>
  );
}

function CoverFace({ mag }: { mag: Mag }) {
  const isNews = mag.kind === "news";
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", isNews ? "rounded-[1px]" : "rounded-[2px]")}
      style={{
        // Paper edge + a hint of stacked-page thickness along the bottom.
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 -2px 0 rgba(0,0,0,0.16)",
      }}
    >
      {mag.kind === "news" && <NewsArt mag={mag} />}
      {mag.kind === "photo" && <PhotoArt mag={mag} />}
      {mag.kind === "boxed" && <BoxedArt mag={mag} />}
      {mag.kind === "illus" && <IllusArt mag={mag} />}
      {/* glossy sheen on magazines; newsprint stays matte */}
      {!isNews && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0) 40%)",
          }}
        />
      )}
      {mag.isNew && (
        <div
          className="absolute top-[9px] -right-[20px] w-[68px] rotate-45 bg-[#2f6fd6] py-[1px] text-center text-[6.5px] font-bold uppercase tracking-wide text-white shadow-sm"
          style={{ transformOrigin: "center" }}
        >
          New
        </div>
      )}
    </div>
  );
}

function Cover({ mag, row, col }: { mag: Mag; row: number; col: number }) {
  const dz = useDepthScale();
  const { hovered, handlers } = useControl(mag.id);
  const [selected, setSelected] = useShared<string | null>("selected", null);
  const anySelected = selected !== null;
  const isSelected = selected === mag.id;
  const lifting = hovered && !anySelected;

  const dx = -slotCenterX(row, col);
  // The Case is centred in the panel, so its midpoint is the panel's midpoint.
  const dy = CASE_H / 2 - coverCenterY(row, mag.h);

  const target = isSelected
    ? { x: dx, y: dy, z: 58 * dz, scale: 2.2, boxShadow: FOCUS_SHADOW }
    : lifting
      ? { x: 0, y: -14, z: 34 * dz, scale: 1.05, boxShadow: HOVER_SHADOW }
      : { x: 0, y: 0, z: 2 * dz, scale: 1, boxShadow: REST_SHADOW };

  return (
    <button
      {...handlers}
      onClick={() => setSelected((prev) => (prev === mag.id ? null : mag.id))}
      className="relative cursor-pointer bg-transparent p-0 [transform-style:preserve-3d]"
      style={{ width: mag.w, height: mag.h }}
    >
      {/* contact shadow on the deck — stays put (and fades) as the cover lifts */}
      <div
        className="pointer-events-none absolute inset-x-[2px] -bottom-[3px] h-[6px] rounded-full transition-opacity duration-300"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%)",
          opacity: lifting || isSelected ? 0.25 : 1,
        }}
      />
      <motion.div
        className="h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={target}
        transition={{
          type: "spring",
          stiffness: 240,
          damping: 26,
          boxShadow: { type: "tween", duration: 0.35, ease: "easeOut" },
        }}
      >
        <CoverFace mag={mag} />
      </motion.div>
    </button>
  );
}

// --- Shelf furniture ---------------------------------------------------------

// One recessed compartment: back wall, inset side walls, tilted deck and a flat
// front board, all real faces, with the covers standing at the opening.
function Bay({ mags, row }: { mags: Mag[]; row: number }) {
  const dz = useDepthScale();
  const D = RECESS * dz;
  return (
    <div className="relative shrink-0 [transform-style:preserve-3d]" style={{ height: BAY_H }}>
      <div
        className="absolute inset-0"
        style={{ transform: `translateZ(${-D}px)`, background: BACK_WOOD }}
      />
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: D, transformOrigin: "50% 0%", transform: "rotateX(-90deg)", background: CEIL_WOOD }}
      />
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: D, transformOrigin: "0% 50%", transform: "rotateY(76deg)", background: SIDE_L_WOOD }}
      />
      <div
        className="absolute inset-y-0 right-0"
        style={{ width: D, transformOrigin: "100% 50%", transform: "rotateY(-76deg)", background: SIDE_R_WOOD }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: D, transformOrigin: "50% 100%", transform: "rotateX(90deg)", background: DECK_WOOD }}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex items-end justify-center [transform-style:preserve-3d]"
        style={{ gap: GAP, paddingBottom: LIP_H }}
      >
        {mags.map((m, col) => (
          <Cover key={m.id} mag={m} row={row} col={col} />
        ))}
      </div>

      {/* flat front board: bright top edge, dark under-edge, shadow cast below */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: LIP_H,
          transform: `translateZ(${LIP_Z * dz}px)`,
          background: LIP_WOOD,
          boxShadow:
            "inset 0 1px 0 rgba(255,247,222,0.9), inset 0 -1px 0 rgba(90,55,20,0.55), 0 4px 6px rgba(0,0,0,0.45)",
        }}
      />
    </div>
  );
}

function TitleBoard() {
  const dz = useDepthScale();
  return (
    <div
      className="relative flex shrink-0 items-center rounded-t-[12px] px-3"
      style={{
        height: TITLE_H,
        transform: `translateZ(${LIP_Z * dz}px)`,
        background: TITLE_WOOD,
        boxShadow:
          "inset 0 1px 0 rgba(255,248,226,0.85), inset 0 -1px 0 rgba(90,55,20,0.5), 0 4px 7px rgba(0,0,0,0.5)",
      }}
    >
      <span
        className="text-[15px] font-bold text-[#4a2f16]"
        style={{ textShadow: "0 1px 0 rgba(255,246,220,0.75)" }}
      >
        Newsstand
      </span>
    </div>
  );
}

// Dims the shelf when a cover is held up — a plane between the shelf and the
// lifted cover, so the close-up stays bright in front. Clicking it sets the
// cover back down.
function Backdrop() {
  const dz = useDepthScale();
  const [selected, setSelected] = useShared<string | null>("selected", null);
  const on = selected !== null;
  return (
    <div
      onClick={() => setSelected(null)}
      // Only a hair larger than the Case: at z=40 the perspective magnifies it
      // enough to cover, and a big overhang would bleed across into the other eye.
      className="absolute inset-[-4%] transition-opacity duration-300"
      style={{
        transform: `translateZ(${40 * dz}px)`,
        background: "rgba(4,4,6,0.5)",
        opacity: on ? 1 : 0,
        pointerEvents: on ? "auto" : "none",
      }}
    />
  );
}

// The whole cabinet, floating as a rounded modal in the panel: the title board
// on top, three shelves, and a slim wood frame under the last one.
function Case() {
  return (
    <div
      className="relative flex flex-col rounded-[12px] [transform-style:preserve-3d]"
      style={{
        width: 320,
        paddingBottom: BOTTOM_PAD,
        background: LIP_WOOD,
        boxShadow:
          "inset 0 -1px 0 rgba(255,247,222,0.5), inset 0 0 0 1px rgba(90,55,20,0.35), 0 16px 40px rgba(0,0,0,0.6)",
      }}
    >
      <TitleBoard />
      {MAGS.map((mags, i) => (
        <Bay key={i} mags={mags} row={i} />
      ))}
      <Backdrop />
    </div>
  );
}

export function Newsstand({
  enableSync = true,
  showControls = true,
}: {
  enableSync?: boolean;
  showControls?: boolean;
}) {
  return (
    <StereoScene
      enableSync={enableSync}
      showControls={showControls}
      height={SCENE_H}
      cursor="focus"
      originY="37%"
    >
      <Case />
    </StereoScene>
  );
}
