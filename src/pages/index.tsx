import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ACTIVITY_TRANSITION, DISCORD_ID } from "@/util/const";
import { LanyardData } from "@/util/lanyard";
import { Tooltip } from "@/components/Tooltip";

const PROJECTS = {
  "lanyard-profile-readme": "embed discord presence in your github profile",
  "cnrad.dev": "my personal website",
};

interface GitHubRepo {
  stargazers_count: number;
  name: string;
  html_url: string;
}

export default function Home({ projects }: { projects: GitHubRepo[] }) {
  const [activity, setActivity] = useState<LanyardData | null>(null);

  useEffect(() => {
    const update = () =>
      fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setActivity(data.data);
        });

    const task = setInterval(update, 30 * 1000); // every 30 seconds

    update(); // initial

    return () => clearInterval(task);
  }, []);

  return (
    <PageWrapper>
      <PageContent>
        <div className="text-primary flex h-full flex-col gap-6 text-sm max-md:pb-14">
          <div className="flex flex-col">
            <p className="mb-2">
              self-taught, frontend-focused software engineer with a knack for
              making things look nice. fascinated by magic rocks.
            </p>
            <div className="flex flex-row flex-wrap gap-6 gap-y-1">
              <a
                className="text-tertiary hover:text-primary cursor-pointer whitespace-nowrap transition-colors duration-100"
                href="https://github.com/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
              <a
                className="text-tertiary hover:text-primary cursor-pointer whitespace-nowrap transition-colors duration-100"
                href="https://x.com/notcnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                twitter (x)
              </a>
              <a
                className="text-tertiary hover:text-primary cursor-pointer whitespace-nowrap transition-colors duration-100"
                href="https://linkedin.com/in/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </a>

              <a
                href="mailto:hello@cnrad.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tertiary hover:text-primary cursor-pointer whitespace-nowrap transition-colors duration-100"
              >
                message
                {/* Open up popover with 2 options - chat, or mail - clicking chat opens a modal */}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="leading-none font-bold">philosophy</h3>
            <div className="ml-3">
              <p>- ship fast, with intention</p>
              <p>- great interaction follows intuition</p>
              <p>- habitualize excellence</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="leading-none font-bold">experience</h3>

            <div className="text-primary relative ml-3 flex flex-col gap-1.5">
              <LinkPreview preview="/main/cside.webp" href="https://cside.dev">
                <p>
                  <span className="font-medium transition-colors duration-150 group-hover:text-[#2500DC]">
                    c/side
                  </span>{" "}
                  <span className="font-normal italic">(2024 - present)</span>
                </p>
                <p className="text-tertiary">frontend engineer</p>
              </LinkPreview>

              <LinkPreview preview="/main/incard.webp" href="https://incard.co">
                <p>
                  <span className="font-medium transition-colors duration-150 group-hover:text-[#8bd442]">
                    incard
                  </span>{" "}
                  <span className="font-normal italic">(2024, 2025)</span>
                </p>
                <p className="text-tertiary">frontend engineer (contract)</p>
              </LinkPreview>

              <LinkPreview
                preview="/main/dimension.webp"
                href="https://dimension.dev"
              >
                <p>
                  <span
                    className="text-primary font-medium transition-colors duration-150 group-hover:text-transparent"
                    style={{
                      background:
                        "linear-gradient(135deg, color(display-p3 .6196078431 .4784313725 1/1) 0%,color(display-p3 .9960784314 .5450980392 .7333333333/1) 33.33%,color(display-p3 1 .7411764706 .4784313725/1) 100%)",
                      backgroundClip: "text",
                    }}
                  >
                    dimension
                  </span>{" "}
                  <span className="font-normal italic">(2023 - 2024)</span>
                </p>
                <p className="text-tertiary">full-stack engineer</p>
              </LinkPreview>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="leading-none font-bold">projects</h3>

            <div className="ml-3 flex flex-col gap-1.5">
              {Object.entries(PROJECTS).map(([name, description]) => {
                const project = projects.find((e) => e.name === name)!;

                return (
                  <a
                    key={name}
                    href={project.html_url}
                    className="group flex cursor-pointer flex-col"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <p className="flex flex-row gap-1 font-medium transition-colors duration-100 group-hover:text-blue-700">
                      <span>{name}</span>

                      <span className="text-tertiary group-hover:text-secondary ml-0.5 items-center font-light italic transition-colors duration-100">
                        [{project.stargazers_count} stars]
                      </span>
                    </p>
                    <p className="opacity-50">{description}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </PageContent>

      {activity?.listening_to_spotify ? (
        <motion.div
          initial={ACTIVITY_TRANSITION.initial}
          animate={ACTIVITY_TRANSITION.animate}
          exit={ACTIVITY_TRANSITION.exit}
          transition={{ duration: 1.5, ease: [0.26, 1, 0.6, 1] }}
          className="absolute right-10 bottom-10 mt-auto w-auto flex-col items-end justify-end max-sm:hidden"
        >
          <div className="flex flex-row items-center gap-2">
            <div className="relative size-1.5 overflow-visible">
              <span className="absolute size-[5px] rounded-full bg-green-600" />
              <span className="absolute size-[5px] animate-ping rounded-full bg-[color(display-p3_0.385_0.8_0.414_/_1)] [animation-duration:2s]" />
            </div>

            <div className="text-secondary mt-0.5 flex flex-row gap-1 text-end text-sm">
              Listening to{" "}
              <span className="relative w-min whitespace-nowrap">
                <Tooltip
                  className="absolute -top-18 left-1/2 !ml-0 -translate-x-1/2 overflow-visible border-none p-0"
                  content={
                    <div className="relative h-24 w-24 overflow-visible">
                      {/* eslint-disable @next/next/no-img-element */}
                      <img
                        src={activity.spotify.album_art_url}
                        width={96}
                        height={96}
                        alt={activity.spotify.album}
                        fetchPriority="high"
                        className="absolute rounded-md shadow-md select-none"
                        draggable={false}
                        rounded-md
                      />
                    </div>
                  }
                >
                  <a
                    href={`https://open.spotify.com/track/${activity.spotify.track_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary cursor-alias rounded-[5px] font-medium"
                  >
                    {activity.spotify.song}
                  </a>
                </Tooltip>
              </span>{" "}
              by{" "}
              <span className="text-primary font-medium">
                {activity.spotify.artist}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </PageWrapper>
  );
}

// I miss nextjs 12
export async function getStaticProps() {
  const repos = (await fetch(
    `https://api.github.com/users/cnrad/repos?type=owner&per_page=100`,
  ).then((res) => res.json())) as GitHubRepo[];

  const projects = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .filter((e) => Object.keys(PROJECTS).includes(e.name));

  return {
    props: { projects },
    revalidate: 3600, // every hour
  };
}

const LinkPreview = ({
  href,
  preview,
  children,
}: {
  href: string;
  preview: string;
  children: React.ReactNode;
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <div>
      <AnimatePresence>
        {showPreview ? (
          <motion.a
            initial={{ scale: 0.98, x: -4, opacity: 0 }}
            animate={{ scale: 1, x: 0, opacity: 1 }}
            exit={{
              scale: 0.98,

              x: -4,
              opacity: 0,
              transition: { delay: 0.015 },
            }}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onMouseOver={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
            transition={{
              duration: 0.25,
              ease: [0.26, 1, 0.6, 1],
            }}
            className="group fixed left-54 z-10 max-w-64 min-w-64 overflow-clip rounded-[8px] border border-black/20 bg-[#E7E5E4] p-0.5 shadow-lg transition-colors duration-100 hover:bg-[#efebe9] max-sm:hidden"
            style={{
              marginTop: `calc(-${
                linkRef.current?.getBoundingClientRect().height ?? 0
              }px)`,
            }}
          >
            <Image
              src={preview}
              alt={`Screenshot of ${href}'s landing`}
              width={512}
              height={272}
              className="bg-tertiary overflow-clip rounded-[6px]"
            />

            <p className="text-tertiary w-full rounded-full px-1.5 pt-1 text-center text-xs font-medium transition-colors duration-100 group-hover:text-blue-700">
              {href.split("://")[1]}
            </p>
          </motion.a>
        ) : null}
      </AnimatePresence>

      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        onMouseOver={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="group relative flex w-full max-w-44 flex-col whitespace-nowrap"
      >
        {children}
      </a>
    </div>
  );
};
