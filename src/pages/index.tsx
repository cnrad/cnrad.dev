import GradientBar from "../components/GradientBar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const App = () => {
    return (
        <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: "easeOut", duration: 0.25 }}
            className="mt-12 w-full h-screen"
        >
            <h1 className="mt-36 text-white font-bold text-4xl">Hey, I'm Conrad</h1>
        </motion.div>
    );
};

export default App;
