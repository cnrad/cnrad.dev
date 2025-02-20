import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { CurrentAge } from "@/components/more/CurrentAge";

export default function Home() {
  return (
    <PageWrapper>
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full">
          <div className="flex flex-col">
            <p className="mb-2">i do more than just writing code (sometimes)</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">fun stats</h3>
            <div className="ml-3">
              <p>
                - i&apos;m <CurrentAge /> years old
              </p>
              <p>- my net views (across tv, tiktok, etc.) is ~80,000,000</p>
              <p>
                - i&apos;m pretty good at rudimental drumming (marching arts)
              </p>
              <p>- i like creating electronic music in my spare time</p>
              <p>
                - before you see me and ask, i&apos;m 6&apos;7&quot; - no,
                i&apos;m not lying
              </p>
            </div>
          </div>

          {/* TODO: this isn't really possible with apple music unless i scrobble on last fm */}
          {/* <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">
              what i&apos;ve been listening to
            </h3>
            <div className="ml-3">
              <p>- songs here</p>
            </div>
          </div> */}
        </div>
      </PageContent>
    </PageWrapper>
  );
}
