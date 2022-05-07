import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = () => {
    const [theme, setTheme] = useState<string>("dark");

    useEffect(() => {
        let storedTheme = localStorage.getItem("theme") as string;

        if (!storedTheme) {
            localStorage.setItem("theme", theme);
        } else {
            setTheme(storedTheme);
            storedTheme === "dark" ? document.querySelector("html")?.classList.add("dark") : null;
        }
    }, []);

    const changeTheme = (theme: string) => {
        let newTheme = theme === "light" ? "dark" : "light";

        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
        newTheme === "light"
            ? document.querySelector("html")?.classList.remove("dark")
            : document.querySelector("html")?.classList.add("dark");
    };

    return (
        <button
            className="p-2 rounded-md bg-transparent hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            onClick={() => changeTheme(theme)}
        >
            {theme === "light" && <FiSun className="text-black w-6 h-6 xs:w-5 xs:h-5" />}
            {theme === "dark" && <FiMoon className="text-white w-6 h-6 xs:w-5 xs:h-5" />}
        </button>
    );
};

export default ThemeToggle;
