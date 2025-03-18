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
    <PageWrapper className="@max-xl:pr-0 sm:pr-12">
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full">
          <div className="flex flex-col">
            <p className="mb-2">
              digital abstract expressionist. seeking to understand the
              relationship between color, form, and feeling.
            </p>
            <div className="flex flex-row gap-6">
              <a
                className="cursor-pointer text-tertiary hover:text-primary transition-colors duration-100 whitespace-nowrap"
                href="https://unsplash.com/@cnrad"
                target="_blank"
                rel="noopener noreferrer"
              >
                unsplash
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
                target="_blank"
                rel="noopener noreferrer"
              >
                message
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold leading-none">collections</h3>

            {COLLECTIONS.map((collection) => (
              <a
                key={collection.name}
                className="flex flex-col mb-2 rounded-lg hover:brightness-75 cursor-pointer transition-all duration-500 overflow-clip h-40 ![background-size:100%] hover:![background-size:103%]"
                style={{
                  background: `url(${collection.thumbnail})`,
                  backgroundPosition: "center",
                  transitionTimingFunction: "cubic-bezier(0.26,1,0.6,1)",
                }}
                href={collection.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <div className="p-5 bg-linear-to-t from-black from-25% to-black/0 mt-auto">
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
        </div>
      </PageContent>

      <Gallery />
    </PageWrapper>
  );
}
