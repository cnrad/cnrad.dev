import { WritingCanvas } from "./WritingCanvas";

// A minimal side-view of stereoscopy: a viewer on the left, each eye casting a
// line of sight that crosses the other's. Where they cross sits each eye's
// "implied screen" — the slightly different plane each eye is really looking at.
// The two eyes are told apart by tone (bright vs dim) rather than colour, to
// stay within the site's monochrome palette.

export function PerspectiveDiagram() {
  return (
    <WritingCanvas>
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-5">
        <svg
          viewBox="0 0 640 240"
          className="mx-auto block w-full max-w-2xl"
          role="img"
          aria-label="A viewer's two eyes each cast a line of sight; the lines cross, and each eye's implied screen sits at the crossing — the offset between them is the depth the brain reconstructs."
        >
          <defs>
            <marker
              id="pd-arrow-a"
              markerWidth="9"
              markerHeight="9"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" className="fill-neutral-300" />
            </marker>
            <marker
              id="pd-arrow-b"
              markerWidth="9"
              markerHeight="9"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" className="fill-neutral-500" />
            </marker>
          </defs>

          {/* viewer */}
          <circle cx="118" cy="120" r="92" className="fill-neutral-800" />

          {/* sight-lines (dotted). Top eye = left eye (bright), bottom eye =
              right eye (dim). Each crosses to the opposite side. */}
          <g strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 11">
            <line
              x1="180"
              y1="92"
              x2="600"
              y2="170"
              className="stroke-neutral-300"
              markerEnd="url(#pd-arrow-a)"
            />
            <line
              x1="180"
              y1="148"
              x2="600"
              y2="70"
              className="stroke-neutral-500"
              markerEnd="url(#pd-arrow-b)"
            />
          </g>

          {/* implied screens — short solid planes at the crossing (~345,120) */}
          <line
            x1="360"
            y1="70"
            x2="332"
            y2="170"
            className="stroke-neutral-300"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="330"
            y1="70"
            x2="358"
            y2="170"
            className="stroke-neutral-500"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* eyes */}
          <circle cx="180" cy="92" r="11" className="fill-neutral-200" />
          <circle cx="180" cy="148" r="11" className="fill-neutral-500" />

          {/* labels */}
          <text
            x="332"
            y="52"
            textAnchor="middle"
            className="fill-neutral-300 text-[11px]"
          >
            Implied left-eye screen
          </text>
          <text
            x="352"
            y="196"
            textAnchor="middle"
            className="fill-neutral-500 text-[11px]"
          >
            Implied right-eye screen
          </text>
          <text
            x="600"
            y="56"
            textAnchor="end"
            className="fill-neutral-500 text-[11px]"
          >
            Right-eye sightline
          </text>
          <text
            x="600"
            y="192"
            textAnchor="end"
            className="fill-neutral-300 text-[11px]"
          >
            Left-eye sightline
          </text>
        </svg>

        <p className="mx-auto mt-2 max-w-md text-center text-[11px] leading-5 text-neutral-500">
          Each eye's line of sight crosses the other's; the offset between the
          two is the depth your brain reconstructs.
        </p>
      </div>
    </WritingCanvas>
  );
}
