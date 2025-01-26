import { useTheme } from "next-themes";

export const ThemeChanger = () => {
  const { setTheme } = useTheme();

  return (
    <>
      <button
        className="text-sm text-primary/50 hover:text-primary transition-colors duration-150 cursor-pointer"
        onClick={() => setTheme("light")}
      >
        light
      </button>
      <button
        className="text-sm text-primary/50 hover:text-primary transition-colors duration-150 cursor-pointer"
        onClick={() => setTheme("sunset")}
      >
        sunset
      </button>
      <button
        className="text-sm text-primary/50 hover:text-primary transition-colors duration-150 cursor-pointer"
        onClick={() => setTheme("dark")}
      >
        dark
      </button>
    </>
  );
};
