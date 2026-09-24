import type { HTMLProps } from "react";
import { cn } from "../../../lib/utils";

// A tactile, layered button for the stereo demos: stacked gradients build a
// bevelled "physical" edge, and it brightens on hover / dips on press. Shared so
// every stereo component gets the same control styling. `variant` picks the
// colorway; `outerClassName` styles the pressable wrapper (e.g. `flex-1`).
interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  variant: "blue" | "black" | "red";
  type?: "submit" | "reset" | "button" | undefined;
  outerClassName?: string;
  /** Controlled hover/press. Inside a synced StereoScene the native :hover and
   *  :active pseudo-classes only ever fire in the ONE panel the mouse is in, so
   *  a scene passes these from the shared store (useControl) instead and both
   *  eyes light up together. Leave them undefined for ordinary CSS behaviour. */
  hovered?: boolean;
  pressed?: boolean;
}

export const Button = ({
  variant,
  children,
  className,
  outerClassName,
  hovered,
  pressed,
  ...props
}: ButtonProps) => {
  const controlled = hovered !== undefined || pressed !== undefined;
  return (
    <div
      className={cn(
        "group duration-100 ease-out transition-all",
        controlled
          ? cn(hovered && "brightness-120", pressed && "scale-98")
          : "hover:brightness-120 active:scale-98",
        outerClassName,
      )}
      data-hovered={controlled && hovered ? "" : undefined}
    >
      <button
        className={cn(
          "rounded-[10px] bg-gradient-to-b p-0.25 cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-100 ease-out",
          {
            "from-[#0072FE] to-[#00469A] drop-shadow-[0_2px_10px_-2px_#298AFF]":
              variant === "blue",
            "from-[#2e2e2e] to-[#0d0d0d] drop-shadow-[0_2px_10px_-2px_#343434]":
              variant === "black",
            "from-[#7d1b20] to-[#3a0506] drop-shadow-[0_8px_20px_-10px_#b14343]":
              variant === "red",
          },
        )}
        {...props}
      >
        <div
          className={cn("bg-gradient-to-b p-0.25 rounded-[9px]", {
            "from-[#97C6FF] to-[#0161D8]": variant === "blue",
            "from-[#6f6f6f] to-[#131313]": variant === "black",
            "from-[#f8686f] to-[#822125]": variant === "red",
          })}
        >
          <div
            className={cn(
              "bg-gradient-to-b rounded-[8px] px-3.5 py-2 font-medium flex flex-row items-center justify-center gap-2",
              {
                "from-[#2888FE] to-[#0362D8]  text-white text-shadow-[0_1px_5px_#0007]":
                  variant === "blue",
                "from-[#0f0f0f] to-[#0d0d0d] text-white/50 group-hover:text-white/70 group-data-hovered:text-white/70 duration-150 ease-out transition-colors text-shadow-[0_2px_10px_-2px_#000b] text-shadow-black":
                  variant === "black",
                "from-[#d8454b] to-[#9c191e] text-white text-shadow-[0_1px_6px_#0007]":
                  variant === "red",
              },
              className,
            )}
          >
            {children}
          </div>
        </div>
      </button>
    </div>
  );
};
