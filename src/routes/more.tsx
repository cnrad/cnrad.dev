import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { ExternalLink } from "lucide-react";
import { isLayoutIntroComplete } from "./layout";

const ITERATIONS = [
  { name: "v3.cnrad.dev", href: "https://v3.cnrad.dev", year: "2025" },
  { name: "v2.cnrad.dev", href: "https://v2.cnrad.dev", year: "2022" },
  { name: "v1.cnrad.dev", href: "https://v1.cnrad.dev", year: "2021" },
];

const BIRTHDAY = new Date(2004, 11, 8); // December 8, 2004

function useAge() {
  const [age, setAge] = useState(() => getAge());

  function getAge() {
    const now = Date.now();
    const diff = now - BIRTHDAY.getTime();
    return diff / (365.25 * 24 * 60 * 60 * 1000);
  }

  useEffect(() => {
    const interval = setInterval(() => setAge(getAge()), 50);
    return () => clearInterval(interval);
  }, []);

  return age;
}

export function More() {
  const age = useAge();
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  const [shimmerEmail, setShimmerEmail] = useState(false);

  useEffect(() => {
    if (location.hash !== "#email") return;
    // Wait for the layout intro on first load; on navigation, fire quickly.
    const delay = isLayoutIntroComplete() ? 600 : 2200;
    const t = setTimeout(() => setShimmerEmail(true), delay);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="flex w-full flex-col gap-8 text-sm text-neutral-400 cursor-default mt-4">
      <p>
        i'm{" "}
        <span className="font-semibold text-neutral-200 tabular-nums">
          {age.toFixed(10)}
        </span>{" "}
        years old. i was a swift student challenge winner in 2022. i am an avid
        enjoyer of electronic music, and i'm alright at{" "}
        <span className="group/drum relative inline-block">
          <a
            className="font-semibold text-neutral-200 animate-link"
            href="https://www.instagram.com/p/DKa9eaBhsTQ/"
            target="_blank"
            rel="noopener noreferrer"
          >
            rudimental drumming
          </a>
          <span className="pointer-events-none brightness-75 absolute bottom-full left-0 z-50 px-1 w-full origin-top scale-98 translate-y-1 opacity-0 transition-all duration-200 ease-out group-hover/drum:translate-y-0 group-hover/drum:scale-100 group-hover/drum:opacity-100">
            <video
              ref={videoRef}
              src="/misc/drumming.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="relative w-full rounded-xl shadow-xl z-100 outline -outline-offset-1 outline-neutral-200/20"
            />
          </span>
        </span>
        . i'm sort of tall.
      </p>

      <p>
        you can reach out to me at{" "}
        <a
          href="mailto:hello@cnrad.dev"
          data-shimmer-text="hello@cnrad.dev"
          className={`text-neutral-200 hover:text-white font-semibold animate-link${
            shimmerEmail ? " shimmer-once" : ""
          }`}
        >
          hello@cnrad.dev
        </a>{" "}
        — or shoot me a message on X.
      </p>

      <div className="text-sm text-neutral-600 flex flex-row gap-3 items-start">
        past iterations of this site:
        <div className="flex flex-col group *:first:pt-0 *:last:pb-0 *:hit-area font-medium">
          {ITERATIONS.map((iter) => (
            <a
              key={iter.name}
              href={iter.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group/link inline-flex items-center gap-1 text-neutral-400 transition-colors duration-150 ease-out hover:text-neutral-200 group-hover:not-hover:text-neutral-500"
            >
              {iter.name}
              <ExternalLink className="size-2.5 ml-1 scale-50 origin-left opacity-0 transition-all duration-200 ease-out group-hover/link:scale-100 group-hover/link:opacity-100" />
            </a>
          ))}
        </div>
        <div className="flex flex-col group *:first:pt-0 *:last:pb-0 font-medium ml-auto">
          {ITERATIONS.map((iter) => (
            <p key={iter.name} className="text-neutral-600 font-medium italic">
              ({iter.year})
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
