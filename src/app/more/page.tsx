import { Nav } from "@/components/Nav";
import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { CurrentAge } from "@/components/more/CurrentAge";

export default function Home() {
  return (
    <PageWrapper>
      <Nav />

      <PageContent key="more">
        <div className="flex flex-col gap-6 text-sm h-full mt-6">
          <div className="flex flex-col">
            <h1 className="text-2xl mb-1 font-medium text-black">
              Conrad Crawford
            </h1>
            <p className="mb-2">
              below are some other things. i'm not sure what they are yet.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">fun stats</h3>
            <div className="ml-3">
              <p>
                - i'm <CurrentAge /> years old
              </p>
              <p>
                - my "view" net worth (across tv, tiktok, etc.) is ~80,000,000
              </p>
              <p>- i'm pretty good at rudimental drumming (marching arts)</p>
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
