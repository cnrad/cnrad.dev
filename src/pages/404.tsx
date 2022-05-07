import React from "react";
import MessageComponent from "../components/talk/MessageComponent";
import ContactLink from "../components/talk/ContactLink";
import { SiTwitter, SiDiscord } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import GradientBar from "../components/GradientBar";
import TimeStatus from "../components/talk/TimeStatus";

const Talk = () => {
    return (
        <motion.div
            key="talk"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: "easeOut", duration: 0.25 }}
            className="mt-36 mb-80 w-full"
        >
            <h1 className="text-black dark:text-white font-bold text-3xl mb-3 mt-8">Hmm... Thinking... 🤔</h1>
            <p className="text-black dark:text-gray-200 mb-6">It appears that what you're looking for isn't here.</p>
        </motion.div>
    );
};

export default Talk;
