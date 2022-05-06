import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = () => {
    const [theme, setTheme] = useState<string>("light");

    useEffect(() => {
        let theme = localStorage.getItem("theme") as string;

        if (typeof localStorage.getItem("theme") !== "string") {
            window.matchMedia("(prefers-color-scheme: dark)").matches ? setTheme("dark") : setTheme("light");
            localStorage.setItem("theme", theme);
        } else {
            setTheme(theme);
            theme === "dark" ? document.querySelector("html")?.classList.add("dark") : null;
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
            {theme === "light" && <FiSun className="text-black w-5 h-5" />}

            {theme === "dark" && <FiMoon className="text-white w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
