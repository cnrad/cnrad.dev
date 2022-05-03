import { motion, useViewportScroll } from "framer-motion";
import { SiTwitter, SiGithub, SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LandingButton = ({ name, link }: any) => {
    return (
        <Link href={link}>
            <motion.h1
                animate={{
                    color: "rgba(255, 255, 255, 0.8)",
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    borderRadius: "0.25rem",
                }}
                whileHover={{
                    color: "rgba(255, 255, 255, 1)",
                    backgroundColor: "rgba(200, 200, 220, 0.1)",
                    borderRadius: "0.45rem",
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm"
            >
                {name}
            </motion.h1>
        </Link>
    );
};

const LinkButton = ({ icon, href }: any) => {
    return (
        <a target="_blank" rel="noreferrer" href={href}>
            {icon}
        </a>
    );
};

const Nav = () => {
    const prevScrollY = useRef(0);
    const [navShow, setNavShow] = useState(true);

    useEffect(() => {
        const onScroll = () => {
            if (prevScrollY.current > window.scrollY) {
                prevScrollY.current = window.scrollY;
                return setNavShow(true);
            } else {
                prevScrollY.current = window.scrollY;
                return setNavShow(false);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.div
            animate={{ opacity: navShow ? 1 : 0.3, y: navShow ? 0 : -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="z-[999] fixed w-[90%] md:w-[50rem] flex flex-row justify-between items-center px-4 py-2 mt-4 md:mt-6 rounded-md bg-[#12181d]/60 border border-slate-800/50 backdrop-blur-lg"
        >
            <div className="flex flex-row items-center justify-between">
                <LandingButton name="Home" link="/" />
                <LandingButton name="Contact" link="/contact" />
            </div>

            <div className="flex flex-row items-center justify-center gap-4 text-white">
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
