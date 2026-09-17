import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

// A shared frame for interactive components embedded in writing posts: a
// full-width, slightly-lighter-than-the-page container with a subtle border.
// The component's own surface sits inside it as an inset, bordered panel.
//
// Concentric geometry: 6px padding + a 12px (rounded-xl) inner radius, so the
// outer radius is 12 + 6 = 18px. Inner content should be `rounded-xl` with its
// own border to keep the two radii concentric.
export function WritingCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-5 w-full rounded-[18px] border border-neutral-800 bg-neutral-900 p-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
