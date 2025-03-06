import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";

const PROJECTS = {
  "lanyard-profile-readme": {
    name: "lanyard-profile-readme",
    description: "embed discord presence in your github profile",
    href: "",
  },
  "cnrad.dev": {
    name: "cnrad.dev",
    description: "my personal website",
    href: "",
  },
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
              <a
                href="https://cside.dev"
                target="_blank"
                rel="noreferrer noopener"
                className="flex flex-col group"
              >
                <p>
                  <span className="font-medium group-hover:text-[#2500DC] transition-colors duration-150">
                    c/side
                  </span>{" "}
                  <span className="italic font-normal">(2024 - present)</span>
                </p>
                <p className="text-tertiary">frontend engineer</p>
              </a>

              <a
                href="https://incard.co"
                target="_blank"
                rel="noreferrer noopener"
                className="flex flex-col group"
              >
                <p>
                  <span className="font-medium group-hover:text-[#8bd442] transition-colors duration-150">
                    incard
                  </span>{" "}
                  <span className="italic font-normal">(2024, 2025)</span>
                </p>
                <p className="text-tertiary">frontend engineer (contract)</p>
              </a>

              <a
                href="https://dimension.dev"
                target="_blank"
                rel="noreferrer noopener"
                className="flex flex-col group"
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
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">projects</h3>

            <div className="ml-3 flex flex-col gap-1.5">
              {Object.entries(PROJECTS).map(([name, info]) => {
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
                    <p className="opacity-50">{info.description}</p>
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
