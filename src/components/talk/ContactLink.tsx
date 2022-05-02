import React, { ReactElement } from "react";
import { FiExternalLink } from "react-icons/fi";
import { animated, useSpring } from "react-spring";
import Link from "next/link";

const ContactLink = ({ name, icon, link }: { name: string; icon: ReactElement; link: string }) => {
    const calc = (x: number, y: number) => [-(y - window.innerHeight / 2) / 35, (x - window.innerWidth / 2) / 35, 1.05];
    const trans = (x: number, y: number, s: number): string =>
        `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

    const [props, set] = useSpring(() => ({
        xys: [0, 0, 1],
        config: { mass: 1, tension: 350, friction: 40 },
    }));

    return (
        <Link href={link} passHref>
            <animated.a
                target="_blank"
                rel="noreferrer noopener"
                onMouseMove={({ clientX: x, clientY: y }: { clientX: number; clientY: number }) =>
                    set({ xys: calc(x, y) })
                }
                onMouseLeave={() => set({ xys: [0, 0, 1] })}
                style={{ transform: props.xys.to(trans) }}
                className="mb-4 row-start-3 flex flex-row items-center bg-opacity-50 bg-slate-500/10 rounded-md p-4 border border-zinc-800/50 cursor-pointer"
            >
                {icon}
                <h1 className="font-medium text-sm text-slate-400 mx-2">{name}</h1>
                <FiExternalLink className="w-5 h-5 text-gray-600" />
            </animated.a>
        </Link>
    );
};

export default ContactLink;
