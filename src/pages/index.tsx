import GradientBar from "../components/GradientBar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const App = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: "easeOut", duration: 0.15 }}
            className="mt-24 w-full mb-32"
        >
            <h1 className="mt-36 text-white font-bold text-5xl mb-6">Hey, I'm Conrad ✌️</h1>
            <p className="text-gray-300 leading-6 font-light tracking-wide">
                I'm a full-stack software engineer from the United States. I'm currently pursuing full-stack web
                development to create stunning website experiences on the front-end, and scalable and secure
                infrastructure on the backend.
            </p>
        </motion.div>
    );
};

export default App;
