import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { Gallery } from "@/components/art/Gallery";

const COLLECTIONS = [
  {
    name: "SPHERUS",
    description: "a collection of attempts to convey ineffable emotions.",
    href: "https://spherus.cnrad.dev",
    thumbnail: "/art/spherus_thumbnail.png",
  },
  {
    name: "FIGURA",
    description:
      "a collection of 12 beautiful, abstract wallpapers - all in stunning 6k resolution.",
    href: "https://cnrad.gumroad.com/l/figura",
    thumbnail: "/art/figura_thumbnail.jpeg",
  },
] as const;

export default function Art() {
  return (
    <div className="h-full w-full flex flex-row">
      <PageWrapper className="pr-12">
        <PageContent key="art">
          <div className="flex flex-col gap-6 text-sm h-full mt-6">
            <div className="flex flex-col">
              <h1 className="text-2xl mb-1 font-medium text-black">
                Conrad Crawford
              </h1>
              <p className="mb-2">
                digital abstract expressionist. exploring the depth of
                expression through color.
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
                <a
                  key={collection.name}
                  className="flex flex-col mb-2 rounded-lg hover:brightness-75 cursor-pointer transition-all duration-200 pt-16 overflow-clip"
                  style={{
                    background: `url(${collection.thumbnail})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                  href={collection.href}
                >
                  <div className="p-5 bg-gradient-to-t from-black from-25% to-black/0">
                    <h5 className="text-white font-medium text-lg">
                      {collection.name}
                    </h5>
                    <p className="text-white opacity-75">
                      {collection.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <p className="font-medium italic text-black/15 mt-auto">
              Conrad Crawford, {new Date().getFullYear()}
            </p>
          </div>
        </PageContent>
      </PageWrapper>

      <div className="h-full w-full text-black text-sm pl-12 pr-24 leading-relaxed overflow-y-auto flex flex-col gap-4 py-24">
        <Gallery />
      </div>
    </div>
  );
}
