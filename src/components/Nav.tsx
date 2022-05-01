import { motion } from "framer-motion";

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
            className="cursor-pointer rounded-lg px-4 py-2"
        >
            {name}
        </motion.h1>
    );
};

const Nav = () => {
    return (
        <div className="w-full flex flex-row justify-between items-center h-16">
            <div className="w-1/2 flex flex-row items-center justify-between">
                <LandingButton name="Home" />
                <LandingButton name="About" />
                <LandingButton name="Contact" />
            </div>

            <div className="text-white">logo</div>
        </div>
    );
};

export default Nav;
