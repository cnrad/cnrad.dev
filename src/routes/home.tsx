import { cn } from "../lib/utils";

type ExperienceItem = {
  name: string;
  title: string;
  period: string;
  description: string;
  href: string;
  logo: string;
  logoClass: string;
};

const WORK: ExperienceItem[] = [
  {
    name: "cside",
    title: "Product Engineer",
    period: "2024 — Now",
    description: "frontend-focused, making the web secure again",
    href: "https://cside.com",
    logo: "/misc/cside-shield.png",
    logoClass: "size-3",
  },
  {
    name: "Incard",
    title: "Frontend Engineer",
    period: "2024 — 2026",
    description: "marketing pages + product design system",
    href: "https://incard.com",
    logo: "/misc/incard-logo.svg",
    logoClass: "w-full px-px",
  },
  {
    name: "Dimension",
    title: "Full-stack Engineer",
    period: "2023 — 2024",
    description: "",
    href: "https://dimension.dev",
    logo: "/misc/dimension.png",
    logoClass: "w-full",
  },
];

const OTHER: ExperienceItem[] = [
  {
    name: "Bagel Fund",
    title: "General Partner",
    period: "2024 — Now",
    description: "microgrants ($100-500) for ambitious young builders",
    href: "https://bagel.fund/",
    logo: "/misc/bagel-fund.png",
    logoClass: "size-3.5",
  },
];

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="size-3 -ml-0.5 shrink-0 text-neutral-600 transition-colors group-hover/link:text-neutral-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.5 8.5 3.5M4 3.5h4.5V8" />
    </svg>
  );
}

function ExperienceRow({ item }: { item: ExperienceItem }) {
  return (
    <div className="flex flex-row gap-4 md:gap-6 group cursor-default hit-area-y-2.5">
      <p className="shrink-0 w-24 text-neutral-500 tabular-nums leading-5 group-hover:text-neutral-200 transition-colors duration-150 ease-out">
        {item.period}
      </p>
      <div className="flex flex-col gap-1 leading-5">
        <div className="flex flex-wrap gap-y-0.5 items-center">
          <span className="font-medium text-white mr-1">{item.title}</span>
          <span className="font-normal text-neutral-500 mr-1.5">at</span>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group/link inline-flex items-center gap-1.5 font-medium text-neutral-100"
          >
            <span
              className={cn(
                "inline-flex mt-0.5 size-3.5 shrink-0 items-center justify-center overflow-clip rounded-sm bg-white data-incard:bg-[rgb(212_255_91)]",
                {
                  "bg-[rgb(212_255_91)]": item.name === "Incard",
                },
              )}
            >
              <img
                src={item.logo}
                alt={`${item.name} logo`}
                className={item.logoClass}
              />
            </span>
            <span className="underline decoration-neutral-600 underline-offset-2 transition-colors group-hover/link:decoration-neutral-300">
              {item.name}
            </span>
            <ArrowUpRight />
          </a>
        </div>
        <p className="text-neutral-500 text-xs">{item.description}</p>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <div className="flex flex-col gap-5 text-sm text-neutral-400 mt-4">
      {/* <p className="text-neutral-400">little blurb about my experience</p> */}
      <div className="h-px w-full bg-neutral-900"></div>
      <div className="flex flex-col gap-5">
        {WORK.map((item) => (
          <ExperienceRow key={item.name} item={item} />
        ))}
      </div>

      <div className="flex flex-col gap-5">
        <div className="h-px w-full bg-neutral-900"></div>
        <div className="flex flex-col gap-5">
          {OTHER.map((item) => (
            <ExperienceRow key={item.name} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
