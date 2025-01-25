import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogContent } from "@/components/blog/BlogWrapper";
import Link from "next/link";

export default function Blog({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex flex-row">
      <PageWrapper>
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

              <BlogPostItem
                slug="why-is-measurable-difference-so-difficult"
                title="Why is measurable difference so difficult?"
                description="Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of"
                date="01/24/25"
              />

              <BlogPostItem
                slug="why-is-measurable-difference-so-difficult"
                title="Why is measurable difference so difficult?"
                description="Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of"
                date="01/24/25"
              />

              <BlogPostItem
                slug="this-is-my-first-post"
                title="This is my first post!"
                description="Hello there I'm SpongeBob is what I tell people normally hahaha lol anyways"
                date="01/24/25"
              />
            </div>

            <p className="font-medium italic text-black/15 mt-auto">
              Conrad Crawford, {new Date().getFullYear()}
            </p>
          </div>
        </PageContent>
      </PageWrapper>

      <BlogContent>{children}</BlogContent>
    </div>
  );
}

const BlogPostItem = ({
  slug,
  title,
  date,
  description,
}: {
  slug: string;
  title: string;
  date: string;
  description: string;
}) => (
  <Link href={`/blog/${slug}`} className="flex flex-col group">
    <h5 className="text-black font-medium">{title}</h5>
    <p className="text-black/50 truncate">{description}</p>
    <p className="font-light italic text-black/60 mt-1">{date}</p>
  </Link>
);
