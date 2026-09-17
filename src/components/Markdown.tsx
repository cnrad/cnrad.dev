import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { WRITING_COMPONENTS } from "./writing/registry";

// A small, dependency-free markdown renderer — just enough for prose posts:
// headings, paragraphs, lists, blockquotes, code (inline + fenced), rules, and
// inline emphasis/links. Content is first-party (our own .md files), so this
// isn't meant to be a hardened general-purpose parser.

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
        <sup key={key++} id={`fnref-${n}`} className="ml-px text-[0.65em]">
          <a href={`#fn-${n}`} className="font-medium text-neutral-400 animate-link">
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
      if (rawImage) {
        src = /\bsrc\s*=\s*["']([^"']+)["']/.exec(line)?.[1] ?? "";
        alt = /\balt\s*=\s*["']([^"']*)["']/.exec(line)?.[1] ?? "";
      }
      blocks.push(
        <img
          key={key++}
          src={src}
          alt={alt}
          className="mx-auto my-2 max-w-full rounded-md border border-neutral-500/10"
          loading="lazy"
        />,
      );
      i++;
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
          <p>
            {parseInline(body.join(" "))}{" "}
            <a
              href={`#fnref-${n}`}
              aria-label="Back to reference"
              className="text-neutral-600 animate-link"
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
          ? "text-lg font-semibold text-neutral-100"
          : level === 2
            ? "text-base font-semibold text-neutral-100"
            : "text-sm font-semibold text-neutral-200";
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      blocks.push(
        <Tag key={key++} className={cls}>
          {text}
        </Tag>,
      );
      i++;
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
    blocks.push(<p key={key++}>{parseInline(para.join(" "))}</p>);
  }

  return (
    <div className="flex flex-col gap-4 text-sm leading-6 text-neutral-200 font-medium">
      {blocks.map((block, idx) => (
        <Fragment key={idx}>{block}</Fragment>
      ))}
    </div>
  );
}
