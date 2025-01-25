import { Nav } from "@/components/Nav";
import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogContent } from "@/components/blog/BlogWrapper";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-row">
      <PageWrapper>
        <Nav />

        <PageContent key="more">
          <div className="flex flex-col gap-6 text-sm h-full mt-6">
            <div className="flex flex-col">
              <h1 className="text-2xl mb-1 font-medium text-black">
                Conrad Crawford
              </h1>
              <p className="mb-2">
                i'm not great at writing, but i'm trying to get better. below
                are some thoughts i have that i care enough about to write
                about.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-sm">
              <h3 className="font-bold leading-none">Blog</h3>

              <div className="flex flex-col">
                <h5 className="text-black font-medium">
                  Why is measurable difference so difficult?
                </h5>
                <p className="text-black/50 truncate">
                  Lorem ipsum about an article here, but it cuts off for some
                  reason I'm not sure of
                </p>
                <p className="font-light italic text-black/60 mt-1">01/24/25</p>
              </div>

              <div className="flex flex-col">
                <h5 className="text-black font-medium">
                  Why is measurable difference so difficult?
                </h5>
                <p className="text-black/50 truncate">
                  Lorem ipsum about an article here, but it cuts off for some
                  reason I'm not sure of
                </p>
                <p className="font-light italic text-black/60 mt-1">01/24/25</p>
              </div>

              <div className="flex flex-col">
                <h5 className="text-black font-medium">
                  This is my first post!
                </h5>
                <p className="text-black/50 truncate">
                  Hello there! "I'm SpongeBob" is what I tell people normally
                  hahaha lol anyways
                </p>
                <p className="font-light italic text-black/60 mt-1">01/24/25</p>
              </div>
            </div>

            <p className="font-medium italic text-black/15 mt-auto">
              Conrad Crawford, {new Date().getFullYear()}
            </p>
          </div>
        </PageContent>
      </PageWrapper>

      <BlogContent>
        <div>
          <header className="font-bold text-2xl mt-8">
            Why is measurable difference so difficult?
          </header>
          <p className="text-black/75 text-base">01/24/25</p>
        </div>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>

        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>

        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>
      </BlogContent>
    </div>
  );
}
