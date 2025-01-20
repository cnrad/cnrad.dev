import { Nav } from "@/components/Nav";
import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <Nav />

      <PageContent key="art">
        <div className="flex flex-col gap-6 text-sm h-full mt-6">
          <div className="flex flex-col">
            <h1 className="text-2xl mb-1 font-medium text-black">
              Conrad Crawford
            </h1>
            <p className="mb-2">
              digital abstract expressionist. exploring how color affects every
              aspect of our lives.
            </p>
            <div className="flex flex-row gap-6">
              <a
                className="cursor-pointer text-[#A0A0A0] hover:text-black transition-colors duration-100"
                href="https://unsplash.com/@cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                unsplash
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
                target="_blank"
                rel="noopener noreferrer"
              >
                message
              </a>
            </div>
          </div>

          <p className="font-medium italic text-black/15 mt-auto">
            Conrad Crawford, {new Date().getFullYear()}
          </p>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
