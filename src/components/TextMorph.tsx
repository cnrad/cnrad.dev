import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router";

type WordMeta = {
  text: string;
  italic?: boolean;
  href?: string;
  shimmer?: boolean;
};

function parseMarkdownLite(input: string): WordMeta[] {
  const words: WordMeta[] = [];
  const regex = /\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|==([^=]+)==/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      for (const w of input.slice(lastIndex, match.index).split(" "))
        if (w) words.push({ text: w });
    }
    if (match[1] !== undefined) {
      for (const w of match[1].split(" "))
        if (w) words.push({ text: w, italic: true });
    } else if (match[2] !== undefined) {
      for (const w of match[2].split(" "))
        if (w) words.push({ text: w, href: match[3] });
    } else if (match[4] !== undefined) {
      for (const w of match[4].split(" "))
        if (w) words.push({ text: w, shimmer: true });
    }
    lastIndex = regex.lastIndex;
    const trailing = input.slice(lastIndex).match(/^[.,;:!?)]+/);
    if (trailing && words.length > 0) {
      words[words.length - 1]!.text += trailing[0];
      lastIndex += trailing[0].length;
    }
  }

  if (lastIndex < input.length) {
    for (const w of input.slice(lastIndex).split(" "))
      if (w) words.push({ text: w });
  }

  return words;
}

export function TextMorph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  // Structural word list — only changes when `text` changes, never per-frame.
  // The animation itself is driven by direct DOM writes in the rAF loops below
  // (see setWordStyle), so animating never triggers React reconciliation. This
  // keeps the morph cheap and resilient when a heavy mount (craft/art videos)
  // is competing for the main thread — the old per-frame setState re-rendered
  // ~60 blurred spans every frame, which Safari in particular choked on.
  const [words, setWords] = useState<WordMeta[]>(() => parseMarkdownLite(text));
  const [oldSnapshot, setOldSnapshot] = useState<{ html: string } | null>(null);
  const prevText = useRef(text);
  const rafRef = useRef<number>(0);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const oldParagraphRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // True when the pending `words` change came from a text swap (→ morph) rather
  // than the first mount (→ intro). A plain boolean read at animation time —
  // NOT a consume-once flag — so it survives React StrictMode's dev remount
  // (mount → cleanup → mount) instead of being nulled out and leaving the
  // intro blank on the second mount.
  const morphRequested = useRef(false);

  // Detect which visual line each word is on
  const getWordLines = useCallback(() => {
    const lineForWord: number[] = [];
    let currentLine = 0;
    let lastTop = -Infinity;

    wordRefs.current.forEach((el, i) => {
      if (!el) {
        lineForWord[i] = currentLine;
        return;
      }
      const top = Math.round(el.getBoundingClientRect().top);
      if (top > lastTop + 2) {
        if (i > 0) currentLine++;
        lastTop = top;
      }
      lineForWord[i] = currentLine;
    });

    return lineForWord;
  }, []);

  const setWordStyle = (
    el: HTMLSpanElement | null | undefined,
    blur: number,
    opacity: number,
    y: number,
  ) => {
    if (!el) return;
    el.style.filter = blur > 0.1 ? `blur(${blur}px)` : "";
    el.style.opacity = String(opacity);
    el.style.transform = y > 0.1 ? `translateY(${y}px)` : "";
    el.style.willChange =
      blur > 0.1 || y > 0.1 ? "filter, opacity, transform" : "auto";
  };

  // A text change: freeze the current paragraph as an outgoing snapshot, then
  // swap in the new word list and queue a morph. Capturing innerHTML here (in
  // the effect, before React re-renders) grabs the DOM as it currently reads.
  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    cancelAnimationFrame(rafRef.current);

    if (paragraphRef.current) {
      setOldSnapshot({ html: paragraphRef.current.innerHTML });
    }
    morphRequested.current = true;
    setWords(parseMarkdownLite(text));
  }, [text]);

  // Runs after `words` renders (so wordRefs point at the new spans) and BEFORE
  // paint (so the hidden start-state is set with no flash of fully-visible
  // text). Drives the whole animation via direct style writes.
  useLayoutEffect(() => {
    // A `words` change is either the first mount (intro) or a text swap (morph).
    // Text swaps always set morphRequested before setWords, so this cleanly
    // distinguishes the two and re-runs correctly on a StrictMode remount.
    const isMorph = morphRequested.current;
    morphRequested.current = false;

    if (!isMorph) {
      // Start hidden.
      for (const el of wordRefs.current) setWordStyle(el, 4, 0, 6);

      // Delay to sync with parent stagger (TextMorph is ~4th child at 0.15s each)
      const mountDelay = 600;
      const maxBlur = 4;
      const maxY = 6;
      const lineDelay = 80; // ms between lines
      const lineDuration = 550; // ms per line to animate

      // Need a frame for layout so getWordLines can read positions.
      const outerFrame = requestAnimationFrame(() => {
        const wordLines = getWordLines();
        const n = words.length;
        const startTime = performance.now() + mountDelay;

        function tick(now: number) {
          const elapsed = now - startTime;
          let allDone = true;

          for (let i = 0; i < n; i++) {
            const line = wordLines[i] ?? 0;
            const lineElapsed = elapsed - line * lineDelay;

            let blur: number, opacity: number, y: number;
            if (lineElapsed < 0) {
              blur = maxBlur;
              opacity = 0;
              y = maxY;
              allDone = false;
            } else if (lineElapsed < lineDuration) {
              const t = lineElapsed / lineDuration;
              const ease = 1 - Math.pow(1 - t, 3); // cubic ease out
              blur = (1 - ease) * maxBlur;
              opacity = ease;
              y = (1 - ease) * maxY;
              allDone = false;
            } else {
              blur = 0;
              opacity = 1;
              y = 0;
            }
            setWordStyle(wordRefs.current[i], blur, opacity, y);
          }

          if (!allDone) rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
      });

      return () => {
        cancelAnimationFrame(outerFrame);
        cancelAnimationFrame(rafRef.current);
      };
    }

    // Morph: per-word blur-in, cross-fading the frozen snapshot out.
    const n = words.length;
    for (let i = 0; i < n; i++) setWordStyle(wordRefs.current[i], 6, 0, 0);

    const staggerMs = 20;
    const blurDownMs = 200;
    const maxBlur = 6;
    const fadeDuration = 300;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      let allDone = true;

      const fadeT = Math.min(elapsed / fadeDuration, 1);
      if (oldParagraphRef.current) {
        oldParagraphRef.current.style.opacity = String(1 - fadeT);
      }

      for (let i = 0; i < n; i++) {
        const wordElapsed = elapsed - i * staggerMs;
        let blur: number, opacity: number;
        if (wordElapsed < 0) {
          blur = maxBlur;
          opacity = 0;
          allDone = false;
        } else if (wordElapsed < blurDownMs) {
          const t = wordElapsed / blurDownMs;
          blur = (1 - t) * maxBlur;
          opacity = t;
          allDone = false;
        } else {
          blur = 0;
          opacity = 1;
        }
        setWordStyle(wordRefs.current[i], blur, opacity, 0);
      }

      if (!allDone || fadeT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOldSnapshot(null);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [words, getWordLines]);

  return (
    <div className="relative">
      {oldSnapshot && (
        <p
          ref={oldParagraphRef}
          className={className}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: 1,
            pointerEvents: "none",
          }}
          dangerouslySetInnerHTML={{ __html: oldSnapshot.html }}
        />
      )}
      <p
        ref={paragraphRef}
        className={className}
        style={{ overflowWrap: "break-word" }}
      >
        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < words.length) {
            const idx = i;
            const w = words[idx]!;
            if (!w.href) {
              elements.push(
                <span key={idx}>
                  {idx > 0 && " "}
                  <span
                    ref={(el) => {
                      wordRefs.current[idx] = el;
                    }}
                    className={
                      w.shimmer ? "inline-block shimmer-text" : "inline-block"
                    }
                    data-shimmer-text={w.shimmer ? w.text : undefined}
                    style={{ fontStyle: w.italic ? "italic" : undefined }}
                  >
                    {w.text}
                  </span>
                </span>,
              );
              i++;
            } else {
              const groupStart = i;
              const href = w.href;
              const groupWords: WordMeta[] = [];
              while (i < words.length && words[i]!.href === href) {
                groupWords.push(words[i]!);
                i++;
              }
              elements.push(
                <span key={groupStart}>
                  {groupStart > 0 && " "}
                  <Link to={href} className="animate-link text-white">
                    {groupWords.map((gw, gi) => (
                      <span key={groupStart + gi}>
                        {gi > 0 && " "}
                        <span
                          ref={(el) => {
                            wordRefs.current[groupStart + gi] = el;
                          }}
                          className="inline-block"
                          style={{ fontStyle: gw.italic ? "italic" : undefined }}
                        >
                          {gw.text}
                        </span>
                      </span>
                    ))}
                  </Link>
                </span>,
              );
            }
          }
          return elements;
        })()}
      </p>
    </div>
  );
}
