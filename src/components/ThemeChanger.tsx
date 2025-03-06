import { AnimatePresence, MotionProps, motion } from "motion/react";
import { useTheme } from "next-themes";

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row gap-2 items-center">
      <button
        tabIndex={0}
        onClick={() =>
          theme === "dark" ? setTheme("light") : setTheme("dark")
        }
        className="relative text-tertiary size-4 cursor-pointer transition-colors duration-150 contrast-[1000] invert"
      >
        <AnimatePresence>
          {theme === "light" ? (
            <MoonIcon
              className="absolute top-0 left-0"
              initial={{ filter: "blur(1px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              exit={{ filter: "blur(1px)", opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            />
          ) : (
            <SunIcon
              className="absolute top-0 left-0"
              initial={{ filter: "blur(1px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              exit={{ filter: "blur(1px)", opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
export default ThemeChanger;

const SunIcon = (props: MotionProps & { className: string }) => {
  return (
    <motion.svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </motion.svg>
  );
};

const MoonIcon = (props: MotionProps & { className: string }) => {
  return (
    <motion.svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </motion.svg>
  );
};
