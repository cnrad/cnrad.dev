import { motion } from "framer-motion";
import { SiTwitter, SiGithub, SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Link from "next/link";

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
    return (
        <div className="w-full flex flex-row justify-between items-center h-16">
            <div className="flex flex-row items-center justify-between">
                <LandingButton name="Home" link="/" />
                <LandingButton name="Talk" link="/talk" />
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
        </div>
    );
};

export default Nav;
