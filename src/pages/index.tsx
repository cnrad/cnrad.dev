import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import Image from "next/image";

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
  return (
    <PageWrapper>
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full text-primary">
          <div className="flex flex-col">
            <p className="mb-2">
              self-taught, frontend-focused software engineer with a knack for
              making things look nice. fascinated by magic rocks.
            </p>
            <div className="flex flex-row gap-6 flex-wrap gap-y-1">
              <a
                className="cursor-pointer text-tertiary hover:text-primary transition-colors duration-100 whitespace-nowrap"
                href="https://github.com/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
              <a
                className="cursor-pointer text-tertiary hover:text-primary transition-colors duration-100 whitespace-nowrap"
                href="https://x.com/notcnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                twitter (x)
              </a>
              <a
                className="cursor-pointer text-tertiary hover:text-primary transition-colors duration-100 whitespace-nowrap"
                href="https://linkedin.com/in/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </a>

              <button className="cursor-pointer text-tertiary hover:text-primary transition-colors duration-100 whitespace-nowrap">
                message
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">philosophy</h3>
            <div className="ml-3">
              <p>- ship fast, with intention</p>
              <p>- great interaction follows intuition</p>
              <p>- if you&apos;re not learning, you&apos;re doing it wrong</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">experience</h3>

            <div className="ml-3 flex flex-col gap-1.5 text-primary relative">
              <LinkPreview preview="/main/cside.webp" href="https://cside.dev">
                <p>
                  <span className="font-medium group-hover:text-[#2500DC] transition-colors duration-150">
                    c/side
                  </span>{" "}
                  <span className="italic font-normal">(2024 - present)</span>
                </p>
                <p className="text-tertiary">frontend engineer</p>
              </LinkPreview>

              <LinkPreview preview="/main/incard.webp" href="https://incard.co">
                <p>
                  <span className="font-medium group-hover:text-[#8bd442] transition-colors duration-150">
                    incard
                  </span>{" "}
                  <span className="italic font-normal">(2024, 2025)</span>
                </p>
                <p className="text-tertiary">frontend engineer (contract)</p>
              </LinkPreview>

              <LinkPreview
                preview="/main/dimension.webp"
                href="https://dimension.dev"
              >
                <p>
                  <span
                    className="font-medium group-hover:text-transparent text-primary transition-colors duration-150"
                    style={{
                      background:
                        "linear-gradient(135deg, color(display-p3 .6196078431 .4784313725 1/1) 0%,color(display-p3 .9960784314 .5450980392 .7333333333/1) 33.33%,color(display-p3 1 .7411764706 .4784313725/1) 100%)",
                      backgroundClip: "text",
                    }}
                  >
                    dimension
                  </span>{" "}
                  <span className="italic font-normal">(2023 - 2024)</span>
                </p>
                <p className="text-tertiary">full-stack engineer</p>
              </LinkPreview>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">projects</h3>

            <div className="ml-3 flex flex-col gap-1.5">
              {Object.entries(PROJECTS).map(([name, description]) => {
                const project = projects.find((e) => e.name === name)!;

                return (
                  <a
                    key={name}
                    href={project.html_url}
                    className="flex flex-col group cursor-pointer"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <p className="flex flex-row gap-1 font-medium group-hover:text-blue-700 transition-colors duration-100">
                      <span>{name}</span>

                      <span className="ml-0.5 font-light italic items-center text-tertiary group-hover:text-secondary transition-colors duration-100">
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
    </PageWrapper>
  );
}

// I miss nextjs 12
export async function getStaticProps() {
  const repos = (await fetch(
    `https://api.github.com/users/cnrad/repos?type=owner&per_page=100`
  ).then((res) => res.json())) as GitHubRepo[];

  const projects = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .filter((e) => Object.keys(PROJECTS).includes(e.name));

  return {
    props: { projects },
    revalidate: 3600,
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
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 4, opacity: 0, transition: { delay: 0.015 } }}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onMouseOver={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
            transition={{
              duration: 0.25,
              ease: [0.26, 1, 0.6, 1],
            }}
            className="group max-sm:hidden fixed border border-black/20 rounded-[8px] z-10 max-w-64 min-w-64 left-54 overflow-clip p-0.5 bg-[#E7E5E4] shadow-lg hover:bg-[#efebe9] transition-colors duration-100"
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
              className="rounded-[6px] bg-tertiary overflow-clip"
            />

            <p className="w-full text-xs text-center text-tertiary px-1.5 font-medium pt-1 rounded-full group-hover:text-blue-700 transition-colors duration-100">
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
        className="relative flex flex-col group w-full whitespace-nowrap max-w-44"
      >
        {children}
      </a>
    </div>
  );
};
