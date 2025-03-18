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
      className="hidden absolute sm:flex left-14 top-14 font-karla pb-3 w-10 text-sm flex-row gap-6 text-tertiary z-[100]"
    >
      {Object.entries(PAGES).map(([name, href]) => (
        <Link
          href={href}
          key={name}
          className={cn("transition-colors duration-100 hover:text-secondary", {
            "text-primary font-medium hover:text-primary":
              href === "/" ? pathname === href : pathname.includes(href),
          })}
        >
          {name}
        </Link>
      ))}
    </div>
  ) : null;
};
