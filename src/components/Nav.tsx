import { motion } from "framer-motion";
import { SiTwitter, SiGithub, SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";

const LandingButton = ({ name }: any) => {
    return (
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
    );
};

const Nav = () => {
    return (
        <div className="w-full flex flex-row justify-between items-center h-16">
            <div className="w-1/4 flex flex-row items-center justify-between">
                <LandingButton name="Home" />
                <LandingButton name="More" />
            </div>

            <div className="flex flex-row items-center justify-center gap-4 text-white">
                <SiGithub className="w-6 h-6 cursor-pointer" />
                <SiTwitter className="w-6 h-6 cursor-pointer" />
                <SiLinkedin className="w-6 h-6 cursor-pointer" />
                <FiMail className="w-6 h-6 cursor-pointer" />
            </div>
        </div>
    );
};

export default Nav;
