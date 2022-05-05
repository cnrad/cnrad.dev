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

interface AppProps {
    stats: Record<string, number>;
}

const Index = ({ stats }: AppProps) => {
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

            <h2 className="text-white font-medium text-3xl mb-4">What I Do</h2>
            <p className="text-gray-300 leading-6 font-light tracking-wide mb-6">
                I'm passionate about everything technology; from designing and developing software, to understanding how
                the many moving parts of the internet work together, to cybersecurity, systems, programming, and more. I
                strive to learn more about these things every day, and utilize my knowledge to further understand{" "}
                <i>how</i> or <i>why</i> certain things work.
                <br className="mb-4" />
                In my free time, I enjoy creating open source projects, so I can learn from others and showcase my
                skills. In total, all of my open sourced projects have earnt me{" "}
                <span className="font-bold text-slate-200">{stats.stars}</span> stars on GitHub, and{" "}
                <span className="font-bold text-slate-200">{stats.forks}</span> people have forked my projects to
                contribute to.
            </p>
            <div className="mb-12">projects</div>

            <h2 className="text-white font-medium text-3xl mb-4">Technologies 💻</h2>
            <p className="text-gray-300 leading-6 font-light tracking-wide mb-6">
                I use many various tools to streamline my development process and increase the quality of both my code,
                and my projects. Below is a list of technologies and languages I've had experience with in the past, or
                use currently.
            </p>
            <div className="w-full flex flex-wrap flex-row justify-center p-1 border border-slate-800 rounded-md bg-black/10 mb-12">
                <TechItem icon={SiTypescript} name="TypeScript" />
                <TechItem icon={SiVisualstudiocode} name="VSCode" />
                <TechItem icon={SiReact} name="React.js" />
                <TechItem icon={SiNodeJs} name="Node.js" />
                <TechItem icon={SiJavascript} name="JavaScript" />
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

export async function getServerSideProps(ctx: any) {
    const stats = await fetch(`https://api.github-star-counter.workers.dev/user/cnrad`).then(res => res.json());

    return {
        props: { stats }, // will be passed to the page component as props
    };
}

export default Index;
