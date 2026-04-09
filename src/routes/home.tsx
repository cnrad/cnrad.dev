const EXPERIENCE = [
  {
    name: "cside",
    role: "frontend-focused engineer making the web secure again.",
    period: "2024 - present",
    href: "https://cside.dev",
    preview: "/main/cside.webp",
    logo: "/misc/cside-shield.png",
    logoClass: "size-8",
  },
  {
    name: "incard",
    role: "landing rebrand + design system",
    period: "2024, 2025, 2026",
    href: "https://incard.co",
    preview: "/main/incard.webp",
    logo: "/misc/incard-logo.svg",
    logoClass: "px-1 w-full",
  },
  {
    name: "dimension",
    role: "full-stack engineer",
    period: "2023 - 2024",
    href: "https://dimension.dev",
    preview: "/main/dimension.webp",
    logo: "/misc/dimension.png",
    logoClass: "w-full",
  },
];

export function Home() {
  return (
    <div className="flex flex-col gap-2 text-sm text-neutral-400 mt-4 group">
      {EXPERIENCE.map((item) => (
        <a
          key={item.name}
          className="w-full flex flex-row items-center p-2.5 rounded-xl border border-neutral-500/10 bg-neutral-950/50 hover:bg-neutral-900/25 hover:border-neutral-500/15 transition-all duration-150 ease-out group-hover:not-hover:brightness-90"
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          <div
            data-incard={item.name === "incard" ? "true" : undefined}
            className="flex size-12 md:size-10 shrink-0 items-center justify-center overflow-clip rounded-md bg-white mr-3 data-incard:bg-[rgb(212_255_91)]"
          >
            <img
              src={item.logo}
              alt={`${item.name} logo`}
              className={item.logoClass}
            />
          </div>
          <div className="flex flex-col w-full leading-5">
            <div className="flex flex-row items-center justify-between">
              <p className="font-semibold text-neutral-200">{item.name}</p>
              <p className="text-neutral-500 text-xs">{item.period}</p>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5 max-w-2/3">
              {item.role}
            </p>
          </div>
        </a>
      ))}

      <p className="text-neutral-400 my-2">
        i also provide microgrants ($100-$500) to ambitious young builders at{" "}
        <a
          href="https://bagel.fund/"
          target="_blank"
          rel="noreferrer noopener"
          className="text-neutral-200 hover:text-white animate-link font-semibold"
        >
          Bagel Fund
        </a>
        .
      </p>
    </div>
  );
}
