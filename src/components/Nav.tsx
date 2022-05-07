import { motion } from "framer-motion";
import { SiTwitter, SiGithub, SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle";
import { classNames } from "../lib/classNames";
import { ReactElement } from "react";

const LandingButton = ({ name, link, selected }: { name: string; link: string; selected: boolean }) => {
    return (
        <Link href={link}>
            <h1
                className={classNames(
                    selected
                        ? "bg-black/10 dark:bg-[#c8c8dc]/10"
                        : "bg-transparent hover:bg-gray-700/5 dark:hover:bg-[#c8c8dc]/5 dark:text-white",
                    "cursor-pointer px-4 py-2 text-sm rounded-md text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-all duration-75"
                )}
            >
                {name}
            </h1>
        </Link>
    );
};

const LinkButton = ({ icon, href }: { icon: ReactElement; href: string }) => {
    return (
        <a target="_blank" rel="noreferrer" href={href}>
            {icon}
        </a>
    );
};

const Nav = () => {
    const router = useRouter();

    return (
        <motion.div className="z-[999] fixed w-[90%] md:w-[50rem] flex flex-row justify-between items-center px-4 py-2 mt-4 md:mt-6 rounded-md bg-white/60 dark:bg-[#12181d]/60 border border-slate-800/50 backdrop-blur-lg">
            <div className="flex flex-row items-center justify-between gap-2">
                <ThemeToggle />
                <LandingButton name="Home" link="/" selected={router.pathname === "/"} />
                <LandingButton name="Contact" link="/contact" selected={router.pathname === "/contact"} />
            </div>

            <div className="flex flex-row items-center justify-center gap-2 xs:gap-4">
                <LinkButton href={"https://github.com/cnrad"} icon={<SiGithub className="w-6 h-6 cursor-pointer" />} />
                <LinkButton
                    href={"https://twitter.com/notcnrad"}
                    icon={<SiTwitter className="w-6 h-6 cursor-pointer" />}
                />
                <LinkButton
                    href={"https://linkedin.com/in/cnrad"}
                    icon={<SiLinkedin className="w-6 h-6 cursor-pointer" />}
                />
                <LinkButton href={"mailto:hello@cnrad.dev"} icon={<FiMail className="w-6 h-6 cursor-pointer" />} />
            </div>
        </motion.div>
    );
};

export default Nav;
