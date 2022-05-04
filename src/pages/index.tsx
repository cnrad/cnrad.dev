import GradientBar from "../components/GradientBar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
    SiVisualstudiocode,
    SiDocker,
    SiGit,
    SiGo,
    SiNextdotjs as SiNextJs,
    SiNodedotjs as SiNodeJs,
    SiPostgresql,
    SiReact,
    SiRedis,
    SiStyledcomponents as SiStyledComponents,
    SiTailwindcss as SiTailwindCSS,
    SiTypescript,
    SiYarn,
    SiSwift,
    SiJavascript,
    SiPython,
    SiPrisma,
} from "react-icons/si";
import { TechItem } from "../components/TechItem";

const Index = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: "easeOut", duration: 0.15 }}
            className="mt-24 w-full mb-32"
        >
            <h1 className="mt-36 text-white font-bold text-5xl mb-6">Hey, I'm Conrad ✌️</h1>
            <p className="text-gray-300 leading-6 font-light tracking-wide mb-12">
                I'm a self-taught software engineer from the United States. I'm currently pursuing full-stack web
                development to create stunning user experiences on the front-end, and scalable and secure infrastructure
                on the backend.
            </p>

            <h2 className="text-white font-medium text-3xl mb-4">Technologies 💻</h2>
            <p className="text-gray-300 leading-6 font-light tracking-wide mb-6">
                I've used a lot of various technologies to streamline my workflow and develop quality projects, and
                always have the desire to learn more and try them out. Below is a list of technologies and languages
                I've used in the past, or use currently.
            </p>
            <div className="w-full flex flex-wrap flex-row justify-center p-1 border border-slate-800 rounded-md bg-black/10">
                <TechItem icon={SiJavascript} name="JavaScript" />
                <TechItem icon={SiTypescript} name="TypeScript" />
                <TechItem icon={SiVisualstudiocode} name="VSCode" />
                <TechItem icon={SiReact} name="React.js" />
                <TechItem icon={SiNodeJs} name="Node.js" />
                <TechItem icon={SiYarn} name="Yarn" />
                <TechItem icon={SiNextJs} name="Next.js" />
                <TechItem icon={SiTailwindCSS} name="TailwindCSS" />
                <TechItem icon={SiStyledComponents} name="styled-components" />
                <TechItem icon={SiPrisma} name="Prisma" />
                <TechItem icon={SiRedis} name="Redis" />
                <TechItem icon={SiPostgresql} name="Postgres" />
                <TechItem icon={SiGit} name="Git" />
                <TechItem icon={SiDocker} name="Docker" />
                <TechItem icon={SiGo} name="Golang" />
                <TechItem icon={SiSwift} name="Swift" />
                <TechItem icon={SiPython} name="Python" />
            </div>
        </motion.div>
    );
};

export default Index;
