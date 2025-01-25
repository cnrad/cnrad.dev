import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full mt-6">
          <div className="flex flex-col">
            <h1 className="text-2xl mb-1 font-medium text-black">
              Conrad Crawford
            </h1>
            <p className="mb-2">
              self-taught, frontend-focused software engineer with a knack for
              making things look good. interested in the why more than the what.
              fascinated by magic rocks.
            </p>
            <div className="flex flex-row gap-6">
              <a
                className="cursor-pointer text-[#A0A0A0] hover:text-black transition-colors duration-100"
                href="https://github.com/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
              <a
                className="cursor-pointer text-[#A0A0A0] hover:text-black transition-colors duration-100"
                href="https://x.com/notcnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                twitter (x)
              </a>
              <a
                className="cursor-pointer text-[#A0A0A0] hover:text-black transition-colors duration-100"
                href="https://linkedin.com/in/cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </a>
              <a
                className="cursor-pointer text-[#A0A0A0] hover:text-black transition-colors duration-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                message
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">philosophy</h3>
            <div className="ml-3">
              <p>- great design mimics our surroundings</p>
              <p>- there is never a right time to take action</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">experience</h3>

            <div className="ml-3 flex flex-col gap-1.5">
              <a href="https://cside.dev" className="flex flex-col group">
                <p>
                  <span className="font-medium group-hover:text-[#2500DC] transition-all duration-200">
                    c/side
                  </span>{" "}
                  <span className="italic font-normal">(2024 - present)</span>
                </p>
                <p className="opacity-50">frontend engineer</p>
              </a>

              <a href="https://incard.co" className="flex flex-col group">
                <p>
                  <span className="font-medium group-hover:text-[#8bd442] transition-all duration-200">
                    incard
                  </span>{" "}
                  <span className="italic font-normal">(2024, 2025)</span>
                </p>
                <p className="opacity-50">frontend engineer (contract)</p>
              </a>

              <a href="https://dimension.dev" className="flex flex-col group">
                <p>
                  <span
                    className="font-medium group-hover:text-transparent text-black transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg,color(display-p3 .6196078431 .4784313725 1/1) 0%,color(display-p3 .9960784314 .5450980392 .7333333333/1) 33.33%,color(display-p3 1 .7411764706 .4784313725/1) 66.67%,color(display-p3 .9725490196 .9176470588 .7647058824/1) 100%)",
                      backgroundClip: "text",
                    }}
                  >
                    dimension
                  </span>{" "}
                  <span className="italic font-normal">(2023 - 2024)</span>
                </p>
                <p className="opacity-50">full-stack engineer</p>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">projects</h3>

            <div className="ml-3 flex flex-col gap-1.5">
              <div className="flex flex-col group cursor-pointer">
                <p className="font-medium group-hover:text-blue-700">
                  lanyard-profile-readme
                </p>
                <p className="opacity-50">
                  embed discord presence in your github profile
                </p>
                <div className="flex flex-row gap-2"></div>
              </div>

              <div className="flex flex-col group cursor-pointer">
                <p className="font-medium group-hover:text-blue-700">
                  cnrad.dev
                </p>
                <p className="opacity-50">my personal website</p>
                <div className="flex flex-row gap-2"></div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
