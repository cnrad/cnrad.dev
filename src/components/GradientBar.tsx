import { motion } from "framer-motion";

const GradientBar = () => {
    return (
        <div className="overflow-hidden h-1 w-full flex items-center justify-center">
            <div className="w-full h-[50rem] bg-gradient-to-l from-violet-800 to-blue-500 transition animate-spin" />
        </div>
    );
};

export default GradientBar;
