import { cn } from "@/util/utils";
import Link from "next/link";
import { useRouter } from "next/router";

const PAGES = {
  home: "/",
  art: "/art",
  blog: "/blog",
  more: "/more",
} as const;

export const Nav = () => {
  const { pathname } = useRouter();

  return pathname !== "/blog/[slug]" ? (
    <div
      key="NAV"
      className="font-karla text-tertiary absolute top-10 left-10 z-[100] hidden w-10 flex-row gap-6 pb-3 text-sm sm:flex"
    >
      {Object.entries(PAGES).map(([name, href]) => (
        <Link
          href={href}
          key={name}
          className={cn("hover:text-secondary transition-colors duration-100", {
            "text-primary hover:text-primary font-medium":
              href === "/" ? pathname === href : pathname.includes(href),
          })}
        >
          {name}
        </Link>
      ))}
    </div>
  ) : null;
};
