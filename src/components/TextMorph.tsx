import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router";

type WordMeta = {
  text: string;
  italic?: boolean;
  href?: string;
};

type WordState = WordMeta & {
  blur: number;
  opacity: number;
  y: number;
};

function parseMarkdownLite(input: string): WordMeta[] {
  const words: WordMeta[] = [];
  const regex = /\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
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
  const [newWords, setNewWords] = useState<WordState[]>(() =>
    parseMarkdownLite(text).map((w) => ({ ...w, blur: 4, opacity: 0, y: 6 })),
  );
  const [oldSnapshot, setOldSnapshot] = useState<{
    html: string;
  } | null>(null);
  const [oldOpacity, setOldOpacity] = useState(0);
  const prevText = useRef(text);
  const rafRef = useRef<number>(0);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimatedIn = useRef(false);

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

  // Initial mount: line-by-line stagger with blur + opacity + y
  useLayoutEffect(() => {
    if (hasAnimatedIn.current) return;
    hasAnimatedIn.current = true;

    // Delay to sync with parent stagger (TextMorph is ~4th child at 0.15s each)
    const mountDelay = 600;

    // Need a frame for refs to populate
    requestAnimationFrame(() => {
      const wordLines = getWordLines();
      const words = parseMarkdownLite(text);
      const maxBlur = 4;
      const maxY = 6;
      const lineDelay = 80; // ms between lines
      const lineDuration = 400; // ms per line to animate
      const startTime = performance.now() + mountDelay;

      function tick(now: number) {
        const elapsed = now - startTime;
        const result: WordState[] = [];
        let allDone = true;

        for (let i = 0; i < words.length; i++) {
          const line = wordLines[i] ?? 0;
          const lineElapsed = elapsed - line * lineDelay;

          if (lineElapsed < 0) {
            result.push({ ...words[i]!, blur: maxBlur, opacity: 0, y: maxY });
            allDone = false;
          } else if (lineElapsed < lineDuration) {
            const t = lineElapsed / lineDuration;
            const ease = 1 - Math.pow(1 - t, 3); // cubic ease out
            result.push({
              ...words[i]!,
              blur: (1 - ease) * maxBlur,
              opacity: ease,
              y: (1 - ease) * maxY,
            });
            allDone = false;
          } else {
            result.push({ ...words[i]!, blur: 0, opacity: 1, y: 0 });
          }
        }

        setNewWords(result);
        if (!allDone) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    });
  }, [text, getWordLines]);

  // Transition between texts
  useEffect(() => {
    if (text === prevText.current) return;

    prevText.current = text;
    cancelAnimationFrame(rafRef.current);

    const toWords = parseMarkdownLite(text);

    // Capture the current rendered paragraph as a frozen snapshot
    if (paragraphRef.current) {
      setOldSnapshot({ html: paragraphRef.current.innerHTML });
    }
    setOldOpacity(1);

    const staggerMs = 20;
    const blurDownMs = 200;
    const maxBlur = 6;
    const fadeDuration = 300;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const result: WordState[] = [];
      let allDone = true;

      const fadeT = Math.min(elapsed / fadeDuration, 1);
      setOldOpacity(1 - fadeT);

      for (let i = 0; i < toWords.length; i++) {
        const wordElapsed = elapsed - i * staggerMs;

        if (wordElapsed < 0) {
          result.push({ ...toWords[i]!, blur: maxBlur, opacity: 0, y: 0 });
          allDone = false;
        } else if (wordElapsed < blurDownMs) {
          const t = wordElapsed / blurDownMs;
          result.push({
            ...toWords[i]!,
            blur: (1 - t) * maxBlur,
            opacity: t,
            y: 0,
          });
          allDone = false;
        } else {
          result.push({ ...toWords[i]!, blur: 0, opacity: 1, y: 0 });
        }
      }

      setNewWords(result);

      if (!allDone || fadeT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOldSnapshot(null);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text]);

  return (
    <div className="relative">
      {oldSnapshot && (
        <p
          className={className}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: oldOpacity,
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
          while (i < newWords.length) {
            const w = newWords[i]!;
            if (!w.href) {
              elements.push(
                <span key={i}>
                  {i > 0 && " "}
                  <span
                    ref={(el) => { wordRefs.current[i] = el; }}
                    className="inline-block"
                    style={{
                      filter: w.blur > 0.1 ? `blur(${w.blur}px)` : "none",
                      opacity: w.opacity,
                      transform: w.y > 0.1 ? `translateY(${w.y}px)` : "none",
                      willChange: w.blur > 0.1 || w.y > 0.1 ? "filter, opacity, transform" : "auto",
                      fontStyle: w.italic ? "italic" : undefined,
                    }}
                  >
                    {w.text}
                  </span>
                </span>
              );
              i++;
            } else {
              const groupStart = i;
              const href = w.href;
              const groupWords: typeof newWords = [];
              while (i < newWords.length && newWords[i]!.href === href) {
                groupWords.push(newWords[i]!);
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
                          ref={(el) => { wordRefs.current[groupStart + gi] = el; }}
                          className="inline-block"
                          style={{
                            filter: gw.blur > 0.1 ? `blur(${gw.blur}px)` : "none",
                            opacity: gw.opacity,
                            transform: gw.y > 0.1 ? `translateY(${gw.y}px)` : "none",
                            willChange: gw.blur > 0.1 || gw.y > 0.1 ? "filter, opacity, transform" : "auto",
                            fontStyle: gw.italic ? "italic" : undefined,
                          }}
                        >
                          {gw.text}
                        </span>
                      </span>
                    ))}
                  </Link>
                </span>
              );
            }
          }
          return elements;
        })()}
      </p>
    </div>
  );
}
