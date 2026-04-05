import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";

type WordState = {
  text: string;
  blur: number;
  opacity: number;
  y: number;
};

export function TextMorph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [newWords, setNewWords] = useState<WordState[]>(() =>
    text.split(" ").map((w) => ({ text: w, blur: 4, opacity: 0, y: 6 })),
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
      const words = text.split(" ");
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
            result.push({ text: words[i]!, blur: maxBlur, opacity: 0, y: maxY });
            allDone = false;
          } else if (lineElapsed < lineDuration) {
            const t = lineElapsed / lineDuration;
            const ease = 1 - Math.pow(1 - t, 3); // cubic ease out
            result.push({
              text: words[i]!,
              blur: (1 - ease) * maxBlur,
              opacity: ease,
              y: (1 - ease) * maxY,
            });
            allDone = false;
          } else {
            result.push({ text: words[i]!, blur: 0, opacity: 1, y: 0 });
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

    const toWords = text.split(" ");

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
          result.push({ text: toWords[i]!, blur: maxBlur, opacity: 0, y: 0 });
          allDone = false;
        } else if (wordElapsed < blurDownMs) {
          const t = wordElapsed / blurDownMs;
          result.push({
            text: toWords[i]!,
            blur: (1 - t) * maxBlur,
            opacity: t,
            y: 0,
          });
          allDone = false;
        } else {
          result.push({ text: toWords[i]!, blur: 0, opacity: 1, y: 0 });
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
        {newWords.map(({ text: word, blur, opacity, y }, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span
              ref={(el) => { wordRefs.current[i] = el; }}
              className="inline-block"
              style={{
                filter: blur > 0.1 ? `blur(${blur}px)` : "none",
                opacity,
                transform: y > 0.1 ? `translateY(${y}px)` : "none",
                willChange: blur > 0.1 || y > 0.1 ? "filter, opacity, transform" : "auto",
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
