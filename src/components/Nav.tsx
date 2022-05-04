import { motion } from "framer-motion";
import { SiTwitter, SiGithub, SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";

const LandingButton = ({ name, link, selected }: any) => {
    return (
        <Link href={link}>
            <motion.h1
                animate={{
                    color: "rgba(255, 255, 255, 0.8)",
                    backgroundColor: selected ? "rgba(200, 200, 220, 0.15)" : "rgba(0, 0, 0, 0)",
                    borderRadius: "0.25rem",
                }}
                whileHover={{
                    color: "rgba(255, 255, 255, 1)",
                    backgroundColor: selected ? "rgba(200, 200, 220, 0.15)" : "rgba(200, 200, 220, 0.05)",
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
    const router = useRouter();

    return (
        <motion.div className="z-[999] fixed w-[90%] md:w-[50rem] flex flex-row justify-between items-center px-4 py-2 mt-4 md:mt-6 rounded-md bg-[#12181d]/60 border border-slate-800/50 backdrop-blur-lg">
            <div className="flex flex-row items-center justify-between gap-2">
                <LandingButton name="Home" link="/" selected={router.pathname === "/"} />
                <LandingButton name="Contact" link="/contact" selected={router.pathname === "/contact"} />
            </div>

            <div className="flex flex-row items-center justify-center gap-4">
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
