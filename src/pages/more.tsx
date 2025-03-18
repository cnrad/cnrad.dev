import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { CurrentAge } from "@/components/more/CurrentAge";

export default function Home() {
  return (
    <PageWrapper>
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full">
          <div className="flex flex-col">
            <p className="mb-2">
              you clicked it, you got it. here&apos;s some more:
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">fun facts</h3>
            <div className="ml-3">
              <p>
                - i&apos;m <CurrentAge /> years old
              </p>
              <p>- my net views (across tv, tiktok, etc.) is ~80,000,000</p>
              <p>
                - i was a{" "}
                <a
                  href="https://developer.apple.com/swift-student-challenge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 hover:text-secondary"
                >
                  swift student challenge
                </a>{" "}
                winner in 2022
              </p>
              <p>
                - i&apos;m pretty good at rudimental drumming (marching arts)
              </p>
              <p>- i like creating electronic music in my spare time</p>
              <p>
                - before you see me and ask, i&apos;m 6&apos;7&quot; - yes,
                really
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold leading-none">other links</h3>
            <div className="ml-3">
              <p>
                <a
                  href="https://v2.cnrad.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-[#0000EE]"
                >
                  v2.cnrad.dev
                </a>{" "}
                - the second iteration of my site
              </p>
              <p>
                <a
                  href="https://v1.cnrad.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-[#0000EE]"
                >
                  v1.cnrad.dev
                </a>{" "}
                - the first iteration of my site
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
