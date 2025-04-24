import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ComponentPropsWithRef, useRef, useState } from "react";

interface BlogItem {
  slug: string;
  title: string;
  description: string;
  date: string;
}

export const POSTS: BlogItem[] = [];

export default function Blog() {
  type BlogRef = HTMLAnchorElement | null;
  const [blogRefs] = useState<BlogRef[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredTab = blogRefs[hoveredIndex ?? -1]?.getBoundingClientRect();
  const hoverPadding = ["1.5rem", "0.8rem"];
  const blogPostsContainerRef = useRef<HTMLDivElement>(null);

  return (
    <PageWrapper>
      <PageContent>
        <div className="flex h-full flex-col gap-6 text-sm">
          <p>
            some things are captivating enough for me to attempt to share my
            thoughts on it. you&apos;ll find them here.
          </p>

          <div className="bg-tertiary h-[1px] w-2/3 brightness-175" />

          <motion.div
            ref={blogPostsContainerRef}
            className="relative flex max-w-sm flex-col gap-3"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {POSTS.length > 0 ? (
              POSTS.map((post, i) => (
                <BlogPostItem
                  ref={(el) => {
                    blogRefs[i] = el;
                  }}
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  onPointerEnter={() => setHoveredIndex(i)}
                />
              ))
            ) : (
              <div className="bg-tertiary/10 border-tertiary/15 text-tertiary w-full rounded-lg border py-9 text-center">
                Nothing here quite yet...
              </div>
            )}

            <AnimatePresence>
              {hoveredTab ? (
                <motion.div
                  className="bg-tertiary/8 absolute -z-1 rounded-lg"
                  initial={{
                    top: `calc(${
                      hoveredTab.top -
                      blogPostsContainerRef.current!.getBoundingClientRect().top
                    }px - (${hoverPadding[1]} / 2))`,
                    left: `calc(-${hoverPadding[0]} / 2)`,
                    width: `calc(${hoveredTab.width}px + ${hoverPadding[0]})`,
                    height: `calc(${hoveredTab.height}px + ${hoverPadding[1]})`,
                    opacity: 0,
                  }}
                  animate={{
                    top: `calc(${
                      hoveredTab.top -
                      blogPostsContainerRef.current!.getBoundingClientRect().top
                    }px - (${hoverPadding[1]} / 2))`,
                    left: `calc(-${hoverPadding[0]} / 2)`,
                    width: `calc(${hoveredTab.width}px + ${hoverPadding[0]})`,
                    height: `calc(${hoveredTab.height}px + ${hoverPadding[1]})`,
                    opacity: 1,
                  }}
                  exit={{
                    top: `calc(${
                      hoveredTab.top -
                      blogPostsContainerRef.current!.getBoundingClientRect().top
                    }px - (${hoverPadding[1]} / 2))`,
                    left: `calc(-${hoverPadding[0]} / 2)`,
                    width: `calc(${hoveredTab.width}px + ${hoverPadding[0]})`,
                    height: `calc(${hoveredTab.height}px + ${hoverPadding[1]})`,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: [0.26, 1, 0.6, 1],
                  }}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </PageContent>
    </PageWrapper>
  );
}

export const BlogPostItem = ({
  slug,
  title,
  date,
  description,
  ...rest
}: {
  slug: string;
  title: string;
  date: string;
  description: string;
} & ComponentPropsWithRef<"a">) => (
  <Link
    href={`/blog/${slug}`}
    className="group flex cursor-pointer flex-col text-left"
    {...rest}
  >
    <h5 className="text-primary font-medium">{title}</h5>
    <p className="text-secondary max-w-full truncate">{description}</p>
    <p className="text-secondary mt-1 font-light italic">{date}</p>
  </Link>
);
