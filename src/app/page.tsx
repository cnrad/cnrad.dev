export default function Home() {
  return (
    <div className="flex flex-col max-w-lg h-full">
      <div className="p-3 flex flex-row gap-6 rounded-lg border border-[#a6a6a6/5] bg-gradient-to-b from-black/0 to-black/5 mb-4">
        Nav
      </div>

      <div className="flex flex-col gap-6 text-sm h-full">
        <div className="flex flex-col">
          <h1
            className="text-[1.75rem] italic mb-4 font-ysabeau font-bold bg-black/25 text-transparent leading-normal"
            style={{
              textShadow: "0px 2px 3px white",
              backgroundClip: "text",
            }}
          >
            software should feel good to use
          </h1>
          <p className="mb-2">
            self-taught, frontend-focused software engineer with a knack for
            making things look good. interested in building user experiences
            that excite.
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
            <p>- great design mimics the real world</p>
            <p>- there's never a “right time” to take action</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold leading-none">experience</h3>

          <div className="ml-3 flex flex-col gap-1.5">
            <div className="flex flex-col">
              <p>
                <span className="font-medium">c/side</span>{" "}
                <span className="italic font-normal">(2024 - present)</span>
              </p>
              <p className="opacity-50">frontend engineer</p>
            </div>

            <div className="flex flex-col">
              <p>
                <span className="font-medium">incard</span>{" "}
                <span className="italic font-normal">(2024, 2025)</span>
              </p>
              <p className="opacity-50">frontend engineer (contract)</p>
            </div>

            <div className="flex flex-col">
              <p>
                <span className="font-medium">dimension</span>{" "}
                <span className="italic font-normal">(2023 - 2024)</span>
              </p>
              <p className="opacity-50">full-stack engineer</p>
            </div>
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
              <p className="font-medium group-hover:text-blue-700">cnrad.dev</p>
              <p className="opacity-50">my personal website</p>
              <div className="flex flex-row gap-2"></div>
            </div>
          </div>
        </div>

        <p className="font-medium italic text-black/15 mt-auto">
          Conrad Crawford, 2025
        </p>
      </div>
    </div>
  );
}
