import { motion } from "framer-motion";

const GradientBar = () => {
    return (
        <div className="rounded-full overflow-hidden h-1 w-full flex items-center justify-center mb-4">
            <div className="w-full h-[50rem] bg-gradient-to-l from-indigo-400 via-cyan-600 to-blue-700 transition animate-spin-slow" />
        </div>
    );
};

export default GradientBar;
