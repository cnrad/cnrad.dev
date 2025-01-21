import { Nav } from "@/components/Nav";
import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { Gallery } from "@/components/art/Gallery";

const COLLECTIONS = [
  {
    name: "SPHERUS",
    description: "a collection of attempts to convey ineffable emotions.",
    thumbnail: "/spherus-thumbnail.webp",
    href: "https://spherus.cnrad.dev",
  },
  {
    name: "FIGURA",
    description:
      "a collection of 12 beautiful, abstract wallpapers - all in stunning 6k resolution.",
    thumbnail: "/figura.webp",
    href: "https://cnrad.gumroad.com/l/figura",
  },
] as const;

export default function Art() {
  return (
    <div className="h-full w-full flex flex-row">
      <PageWrapper>
        <Nav />

        <PageContent key="art">
          <div className="flex flex-col gap-6 text-sm h-full mt-6">
            <div className="flex flex-col">
              <h1 className="text-2xl mb-1 font-medium text-black">
                Conrad Crawford
              </h1>
              <p className="mb-2">
                digital abstract expressionist. exploring how color affects
                every aspect of our lives.
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

            <div className="flex flex-col gap-3 max-w-sm">
              <h3 className="font-bold leading-none">collections</h3>

              {COLLECTIONS.map((collection) => (
                <div className="flex flex-row gap-2">
                  <img
                    src={collection.thumbnail}
                    alt={collection.name}
                    className="rounded-sm w-16 h-full object-cover"
                  />

                  <div key={collection.name} className="flex flex-col">
                    <h5 className="text-black font-medium">
                      {collection.name}
                    </h5>
                    <p className="text-black/50 mb-2">
                      {collection.description}
                    </p>
                    <a
                      href={collection.href}
                      className="text-black/60 w-min hover:text-black"
                    >
                      Visit
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="font-medium italic text-black/15 mt-auto">
              Conrad Crawford, {new Date().getFullYear()}
            </p>
          </div>
        </PageContent>
      </PageWrapper>

      <div className="h-full w-full text-black text-sm px-24 leading-relaxed overflow-y-auto flex flex-col gap-4 py-24">
        <Gallery />
      </div>
    </div>
  );
}
