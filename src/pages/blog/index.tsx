import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogContent } from "@/components/blog/BlogWrapper";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Blog() {
  const [currentPost, setCurrentPost] = useState<string | null>(null);

  return (
    <PageWrapper>
      <PageContent>
        <div className="flex flex-col gap-6 text-sm h-full">
          <div className="flex flex-col">
            <p className="mb-2">
              i&apos;m not great at writing, but i&apos;m trying to get better.
              below are some thoughts i have that i care enough about to write
              about.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-sm">
            <h3 className="font-bold leading-none">Blog</h3>

            <BlogPostItem
              slug="why-is-measurable-difference-so-difficult"
              title="Why is measurable difference so difficult?"
              description="Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of"
              date="01/24/25"
              onClick={() =>
                setCurrentPost("why-is-measurable-difference-so-difficult")
              }
            />

            <BlogPostItem
              slug="why-is-measurable-difference-so-difficult"
              title="Why is measurable difference so difficult?"
              description="Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of"
              date="01/24/25"
              onClick={() =>
                setCurrentPost("why-is-measurable-difference-so-difficult2")
              }
            />

            <BlogPostItem
              slug="this-is-my-first-post"
              title="This is my first post!"
              description="Hello there I'm SpongeBob is what I tell people normally hahaha lol anyways"
              date="01/24/25"
              onClick={() =>
                setCurrentPost("why-is-measurable-difference-so-difficult3")
              }
            />
          </div>
        </div>
      </PageContent>

      <motion.div
        initial={{
          y: 10,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: -50,
          opacity: 0,
          transition: {
            duration: 0.35,
            ease: [0.26, 1, 0.6, 1],
          },
        }}
        transition={{
          duration: 1,
          ease: [0.26, 1, 0.6, 1],
        }}
      >
        <AnimatePresence mode="wait">
          {currentPost ? (
            <BlogContent key={currentPost}>
              <div>
                <header className="font-bold text-2xl mt-8">
                  Why is measurable difference so difficult?
                </header>
                <p className="text-black/75 text-base">01/24/25</p>
              </div>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <img
                src="/art/light_trail.webp"
                alt="Placeholder"
                className="w-full rounded-lg max-h-64 mt-4"
              />

              <label className="mb-4 text-xs text-black/50">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit.
              </label>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
                sit amet, consectetur, adipisci velit, sed quia non numquam eius
                modi tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam, nisi ut
                aliquid ex ea commodi consequatur? Quis autem vel eum iure
                reprehenderit qui in ea voluptate velit esse quam nihil
                molestiae consequatur, vel illum qui dolorem eum fugiat quo
                voluptas nulla pariatur?
              </p>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
                sit amet, consectetur, adipisci velit, sed quia non numquam eius
                modi tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam, nisi ut
                aliquid ex ea commodi consequatur? Quis autem vel eum iure
                reprehenderit qui in ea voluptate velit esse quam nihil
                molestiae consequatur, vel illum qui dolorem eum fugiat quo
                voluptas nulla pariatur?
              </p>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
                sit amet, consectetur, adipisci velit, sed quia non numquam eius
                modi tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam, nisi ut
                aliquid ex ea commodi consequatur? Quis autem vel eum iure
                reprehenderit qui in ea voluptate velit esse quam nihil
                molestiae consequatur, vel illum qui dolorem eum fugiat quo
                voluptas nulla pariatur?
              </p>
            </BlogContent>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </PageWrapper>
  );
}

{
  /* TODO: <Link href={`/blog/${slug}`} className="flex flex-col group"> */
}
const BlogPostItem = ({
  slug,
  title,
  date,
  description,
  onClick,
}: {
  slug: string;
  title: string;
  date: string;
  description: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="flex flex-col group cursor-pointer">
    <h5 className="text-black font-medium">{title}</h5>
    <p className="text-black/50 truncate">{description}</p>
    <p className="font-light italic text-black/60 mt-1">{date}</p>
  </div>
);
