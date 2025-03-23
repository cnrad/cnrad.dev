import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { Gallery } from "@/components/art/Gallery";

const COLLECTIONS = [
  {
    name: "SPHERUS",
    description: "a collection of attempts to convey ineffable emotions.",
    href: "https://spherus.cnrad.dev",
    thumbnail: "/art/spherus_thumbnail.webp",
  },
  {
    name: "FIGURA",
    description:
      "a collection of 12 beautiful, abstract wallpapers - all in stunning 6k resolution.",
    href: "https://cnrad.gumroad.com/l/figura",
    thumbnail: "/art/figura_thumbnail.webp",
  },
] as const;

export default function Art() {
  return (
    <PageWrapper className="sm:pr-12 @max-xl:pr-0">
      <PageContent>
        <div className="flex h-full flex-col gap-6 text-sm">
          <div className="flex flex-col">
            <p className="mb-2">
              digital abstract expressionist. seeking to understand the
              relationship between color, form, and feeling.
            </p>
            <div className="flex flex-row gap-6">
              <a
                className="text-tertiary hover:text-primary cursor-pointer whitespace-nowrap transition-colors duration-100"
                href="https://unsplash.com/@cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                unsplash
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
                target="_blank"
                rel="noopener noreferrer"
              >
                message
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="leading-none font-bold">collections</h3>

            {COLLECTIONS.map((collection) => (
              <a
                key={collection.name}
                className="mb-2 flex h-40 cursor-pointer flex-col overflow-clip rounded-lg ![background-size:100%] transition-all duration-500 hover:![background-size:103%] hover:brightness-75"
                style={{
                  background: `url(${collection.thumbnail})`,
                  backgroundPosition: "center",
                  transitionTimingFunction: "cubic-bezier(0.26,1,0.6,1)",
                }}
                href={collection.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <div className="mt-auto bg-linear-to-t from-black from-25% to-black/0 p-5">
                  <h5 className="text-lg font-medium text-white">
                    {collection.name}
                  </h5>
                  <p className="text-white opacity-75">
                    {collection.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </PageContent>

      <Gallery />
    </PageWrapper>
  );
}
