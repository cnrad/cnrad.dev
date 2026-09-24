import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { WRITING_COMPONENTS } from "./writing/registry";
import { cn } from "../lib/utils";

// A small, dependency-free markdown renderer — just enough for prose posts:
// headings, paragraphs, lists, blockquotes, code (inline + fenced), rules, and
// inline emphasis/links. Content is first-party (our own .md files), so this
// isn't meant to be a hardened general-purpose parser.

// --- footnote navigation -----------------------------------------------------
//
// Jumping between a footnote reference and its definition is done by hand
// rather than by the anchor's default: the target is scrolled to sit about a
// third of the way down the viewport (where the eye already is, instead of
// pinned to the top edge), and then "bursts" — the same shimmer sweep the /more
// page uses on the contact email — so you can see exactly what you landed on.
// Runs `cb` once a smooth scroll on `scroller` has come to rest: the position
// is sampled every frame and must hold still for a few frames after moving.
// If it never moves (target already in view, or the scroller is pinned at its
// end) it fires after a short grace period; a hard cap guards against a scroll
// that's interrupted mid-way. `scrollend` would be simpler, but Safari support
// is still too recent to lean on.
function afterScroll(scroller: HTMLElement | null, cb: () => void) {
  const read = () => (scroller ? scroller.scrollTop : window.scrollY);
  let last = read();
  let stable = 0;
  let moved = false;
  const t0 = performance.now();
  const tick = () => {
    const now = read();
    if (now !== last) {
      moved = true;
      stable = 0;
      last = now;
    } else {
      stable++;
    }
    const done =
      (moved && stable >= 3) || (!moved && stable >= 8) || performance.now() - t0 > 1800;
    if (done) cb();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function jumpTo(id: string, burst: { selector: string; cls: string }) {
  const el = document.getElementById(id);
  if (!el) return;
  // Posts render inside a scrolling overlay, not the window — so scroll the
  // nearest scrollable ancestor (falling back to the window).
  let scroller: HTMLElement | null = el.parentElement;
  while (scroller) {
    const { overflowY } = getComputedStyle(scroller);
    if (/(auto|scroll)/.test(overflowY) && scroller.scrollHeight > scroller.clientHeight) break;
    scroller = scroller.parentElement;
  }
  const elTop = el.getBoundingClientRect().top;
  if (scroller) {
    const top = scroller.scrollTop + (elTop - scroller.getBoundingClientRect().top) - scroller.clientHeight * 0.35;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  } else {
    const top = elTop + window.scrollY - window.innerHeight * 0.35;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }
  history.replaceState(null, "", `#${id}`);

  // Burst only once the smooth scroll has actually arrived, so the flash lands
  // in view. The class is removed and re-added around a reflow so a repeat
  // click restarts the animation.
  const target = document.querySelector<HTMLElement>(burst.selector);
  if (!target) return;
  afterScroll(scroller, () => {
    target.classList.remove(burst.cls);
    void target.offsetWidth;
    target.classList.add(burst.cls);
    window.setTimeout(() => target.classList.remove(burst.cls), 1600);
  });
}

// The plain words of a footnote, for the shimmer overlay to redraw over the
// real text (it must wrap identically, so no markup).
const plainText = (md: string) =>
  md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "");

// --- inline: bold, italic, inline code, links -------------------------------

const INLINE =
  /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(!\[[^\]]*\]\([^)]+\))|(\[[^\]]*\]\([^)]+\))|(\^\d+)/g;

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-neutral-200">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-neutral-800/60 px-1 py-0.5 font-mono text-[0.8125em] text-neutral-300"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("![")) {
      const m = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(token);
      const alt = m?.[1] ?? "";
      const src = m?.[2] ?? "";
      nodes.push(
        <img
          key={key++}
          src={src}
          alt={alt}
          className="inline-block max-w-full rounded-md border border-neutral-500/10"
          loading="lazy"
        />,
      );
    } else if (token.startsWith("[")) {
      const m = /^\[([^\]]*)\]\(([^)]+)\)$/.exec(token);
      const label = m?.[1] ?? "";
      const href = m?.[2] ?? "";
      const internal = href.startsWith("/") || href.startsWith("#");
      nodes.push(
        internal ? (
          <Link
            key={key++}
            to={href}
            className="font-medium text-neutral-200 animate-link"
          >
            {label}
          </Link>
        ) : (
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-200 animate-link"
          >
            {label}
          </a>
        ),
      );
    } else if (token.startsWith("^")) {
      // footnote reference — a raised, linked number that jumps to the matching
      // definition (a `^N ...` line, rendered at the foot of the post).
      const n = token.slice(1);
      nodes.push(
        <sup
          key={key++}
          id={`fnref-${n}`}
          data-shimmer-text={n}
          className="ml-px text-[0.65em]"
        >
          <a
            href={`#fn-${n}`}
            className="font-medium text-neutral-400 animate-link"
            onClick={(e) => {
              e.preventDefault();
              jumpTo(`fn-${n}`, {
                selector: `#fn-${n} [data-shimmer-text]`,
                cls: "shimmer-once",
              });
            }}
          >
            {n}
          </a>
        </sup>,
      );
    } else {
      // single-asterisk italic
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// --- block-level ------------------------------------------------------------

export function Markdown({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    // blank
    if (line.trim() === "") {
      i++;
      continue;
    }

    // fenced code block
    if (line.trim().startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        body.push(lines[i] ?? "");
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-md border border-neutral-500/10 bg-neutral-950/60 p-3 font-mono text-xs leading-5 text-neutral-400"
        >
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // embedded component. Two forms:
    //   :::component <Name>                 ← bare, no props
    //   :::component <Name>                 ← fenced, with JSON props
    //   { "prop": 1 }
    //   :::
    // A props block is present only when the next line opens with `{`; otherwise
    // this is a bare directive and we consume nothing else (so following prose
    // isn't swallowed even without a closing `:::`).
    const directive = /^:::component\s+(\S+)\s*$/.exec(line.trim());
    if (directive) {
      const name = directive[1] ?? "";
      const body: string[] = [];
      i++;
      if ((lines[i] ?? "").trim().startsWith("{")) {
        while (i < lines.length && (lines[i] ?? "").trim() !== ":::") {
          body.push(lines[i] ?? "");
          i++;
        }
        if (i < lines.length) i++; // closing :::
      } else if ((lines[i] ?? "").trim() === ":::") {
        i++; // empty fenced form
      }
      const Component = WRITING_COMPONENTS[name];
      let props: Record<string, unknown> = {};
      const rawProps = body.join("\n").trim();
      if (rawProps) {
        try {
          props = JSON.parse(rawProps);
        } catch {
          // Leave props empty on malformed JSON; the fallback below still shows
          // a visible marker if the component itself is missing.
        }
      }
      blocks.push(
        Component ? (
          <Component key={key++} {...props} />
        ) : (
          <div
            key={key++}
            className="rounded-md border border-red-500/20 bg-red-950/20 p-3 font-mono text-xs text-red-400/80"
          >
            Unknown component: {name}
          </div>
        ),
      );
      continue;
    }

    // standalone image — a lone markdown image or raw <img> tag on its own line,
    // rendered as a centered block figure rather than inline in a paragraph.
    const mdImage = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());
    const rawImage = /^<img\s+[^>]*\/?>\s*$/.test(line.trim());
    if (mdImage || rawImage) {
      let src = mdImage?.[2] ?? "";
      let alt = mdImage?.[1] ?? "";
      // A raw <img> may carry its own `class` (merged over the defaults below
      // via `cn`, so any Tailwind class wins) for per-image styling. Markdown
      // `![]()` images have nowhere to put one, so they stay on the defaults.
      let rawClass = "";
      if (rawImage) {
        src = /\bsrc\s*=\s*["']([^"']+)["']/.exec(line)?.[1] ?? "";
        alt = /\balt\s*=\s*["']([^"']*)["']/.exec(line)?.[1] ?? "";
        rawClass =
          /\bclass(?:Name)?\s*=\s*["']([^"']*)["']/.exec(line)?.[1] ?? "";
      }
      i++;

      // An italic line placed directly under the image (no blank line between)
      // becomes its caption — small, muted, centered beneath the figure. The
      // `[^*]` guard keeps `**bold**` from being read as an italic caption.
      const captionMatch = /^\*([^*].*?)\*$/.exec((lines[i] ?? "").trim());
      if (captionMatch) {
        i++;
        blocks.push(
          <figure key={key++} className="mx-auto my-2 flex flex-col gap-2">
            <img
              src={src}
              alt={alt}
              className={cn(
                "max-w-full rounded-md border border-neutral-500/10",
                rawClass,
              )}
              loading="lazy"
            />
            <figcaption className="text-center text-xs leading-5 text-neutral-500">
              {parseInline(captionMatch[1] ?? "")}
            </figcaption>
          </figure>,
        );
        continue;
      }

      blocks.push(
        <img
          key={key++}
          src={src}
          alt={alt}
          className={cn(
            "mx-auto my-2 max-w-full rounded-md border border-neutral-500/10",
            rawClass,
          )}
          loading="lazy"
        />,
      );
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="border-neutral-500/15" />);
      i++;
      continue;
    }

    // footnote definition: `^N ...` at the start of a line. Rendered small and
    // muted with the number as its marker and a ↩ back to its reference. Wrapped
    // continuation lines are folded in until a blank line or the next footnote.
    const footnote = /^\^(\d+)\s+(.*)$/.exec(line);
    if (footnote) {
      const n = footnote[1] ?? "";
      const body: string[] = [footnote[2] ?? ""];
      i++;
      while (
        i < lines.length &&
        (lines[i] ?? "").trim() !== "" &&
        !/^\^\d+\s+/.test(lines[i] ?? "")
      ) {
        body.push((lines[i] ?? "").trim());
        i++;
      }
      blocks.push(
        <div
          key={key++}
          id={`fn-${n}`}
          className="flex scroll-mt-24 gap-2 text-xs leading-6 text-neutral-500"
        >
          <span className="shrink-0 font-medium text-neutral-400">{n}.</span>
          {/* data-shimmer-text carries the plain sentence for the burst overlay */}
          <p className="shimmer-wrap" data-shimmer-text={plainText(body.join(" "))}>
            {parseInline(body.join(" "))}{" "}
            <a
              href={`#fnref-${n}`}
              aria-label="Back to reference"
              className="text-neutral-600 animate-link"
              onClick={(e) => {
                e.preventDefault();
                // Back to the sentence this footnote hangs off, and burst it.
                jumpTo(`fnref-${n}`, {
                  selector: `[data-fn-sentence="${n}"]`,
                  cls: "sentence-burst",
                });
              }}
            >
              ↩
            </a>
          </p>
        </div>,
      );
      continue;
    }

    // heading
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = (heading[1] ?? "").length;
      const text = parseInline(heading[2] ?? "");
      const cls =
        level === 1
          ? "text-2xl font-semibold text-neutral-100 mt-8"
          : level === 2
            ? "text-xl font-semibold text-neutral-100 mt-8"
            : "text-lg font-semibold text-neutral-200 mt-8";
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      blocks.push(
        <Tag key={key++} className={cls}>
          {text}
        </Tag>,
      );
      i++;
      continue;
    }

    // caption: `>* text *<` on its own line. Attaches to WHATEVER block sits
    // above it (an embedded component, an image, a code block…) — small, muted
    // and centred, pulled up against the block so it reads as its caption
    // rather than a paragraph of its own. Checked before blockquotes, since it
    // also begins with `>`.
    const caption = /^>\*\s*(.+?)\s*\*<$/.exec(line.trim());
    if (caption) {
      i++;
      blocks.push(
        <p
          key={key++}
          className="-mt-2 text-center text-xs leading-5 text-neutral-500"
        >
          {parseInline(caption[1] ?? "")}
        </p>,
      );
      continue;
    }

    // blockquote
    if (line.trimStart().startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trimStart().startsWith(">")) {
        body.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-2 border-neutral-700 pl-4 text-neutral-500 italic"
        >
          {parseInline(body.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // list (unordered or ordered)
    const isUl = /^\s*[-*]\s+/.test(line);
    const isOl = /^\s*\d+\.\s+/.test(line);
    if (isUl || isOl) {
      const items: string[] = [];
      const marker = isUl ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      // A list item continues onto indented follow-on lines until a blank line.
      while (i < lines.length && (lines[i] ?? "").trim() !== "") {
        const cur = lines[i] ?? "";
        if (marker.test(cur)) {
          items.push(cur.replace(marker, ""));
        } else if (items.length > 0) {
          items[items.length - 1] += " " + cur.trim();
        } else {
          break;
        }
        i++;
      }
      const ListTag = isUl ? "ul" : "ol";
      blocks.push(
        <ListTag
          key={key++}
          className={`flex flex-col gap-1.5 pl-5 ${
            isUl ? "list-disc" : "list-decimal"
          } marker:text-neutral-600`}
        >
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // paragraph — gather consecutive non-blank, non-block lines
    const para: string[] = [];
    while (i < lines.length) {
      const cur = lines[i] ?? "";
      if (
        cur.trim() === "" ||
        cur.trim().startsWith("```") ||
        cur.trim().startsWith(":::component") ||
        /^\^\d+\s+/.test(cur) ||
        /^!\[[^\]]*\]\([^)]+\)$/.test(cur.trim()) ||
        /^<img\s+[^>]*\/?>\s*$/.test(cur.trim()) ||
        /^(#{1,3})\s+/.test(cur) ||
        cur.trimStart().startsWith(">") ||
        /^\s*[-*]\s+/.test(cur) ||
        /^\s*\d+\.\s+/.test(cur) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(cur.trim())
      ) {
        break;
      }
      para.push(cur.trim());
      i++;
    }
    // Wrap the sentence each footnote reference belongs to in a marked span, so
    // the ↩ on the footnote can jump back and burst exactly that sentence. A
    // sentence runs from the previous terminator (". ", "? ", "! ") to the ref,
    // taking a terminator that trails the ref ("…effect^2.") along with it.
    const text = para.join(" ");
    const parts: ReactNode[] = [];
    let cursor = 0;
    for (const m of text.matchAll(/\^(\d+)/g)) {
      const idx = m.index ?? 0;
      if (idx < cursor) continue;
      const before = text.slice(0, idx);
      let start = cursor;
      for (const b of before.matchAll(/[.!?]["')\]]*\s+/g)) {
        const s = (b.index ?? 0) + b[0].length;
        if (s >= cursor) start = s;
      }
      const trailing = /^[.!?]["')\]]*/.exec(text.slice(idx + m[0].length))?.[0] ?? "";
      const end = idx + m[0].length + trailing.length;
      parts.push(
        <Fragment key={`b${idx}`}>{parseInline(text.slice(cursor, start))}</Fragment>,
        <span key={`s${idx}`} data-fn-sentence={m[1]} className="rounded-[3px]">
          {parseInline(text.slice(start, end))}
        </span>,
      );
      cursor = end;
    }
    parts.push(<Fragment key="tail">{parseInline(text.slice(cursor))}</Fragment>);
    blocks.push(<p key={key++}>{parts}</p>);
  }

  return (
    <div className="flex flex-col gap-4 text-sm leading-6 text-neutral-200 font-medium">
      {blocks.map((block, idx) => (
        <Fragment key={idx}>{block}</Fragment>
      ))}
    </div>
  );
}
