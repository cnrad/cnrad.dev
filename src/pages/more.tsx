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
              below are some other things. i&apos;m not sure what they are yet.
            </p>
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
            </div>
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
