import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ComponentPropsWithRef, useRef, useState } from "react";

export const POSTS = [
  {
    slug: "interactivity",
    title: "The Nature of Interactivity",
    description:
      "The best digital interactions more often than not mimic real-world interactions.",
    date: "03/11/25",
  },
];

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
        <div className="flex flex-col gap-6 text-sm h-full">
          <p>
            some things are captivating enough for me to attempt to share my
            thoughts on it. you&apos;ll find them here.
          </p>

          <div className="w-2/3 h-[1px] bg-tertiary brightness-175" />

          <motion.div
            ref={blogPostsContainerRef}
            className="relative flex flex-col max-w-sm gap-3"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {POSTS.map((post, i) => (
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
            ))}

            <AnimatePresence>
              {hoveredTab ? (
                <motion.div
                  className="absolute bg-tertiary/8 rounded-lg -z-1"
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
    className="flex flex-col text-left group cursor-pointer"
    {...rest}
  >
    <h5 className="text-primary font-medium">{title}</h5>
    <p className="text-secondary truncate max-w-full">{description}</p>
    <p className="font-light italic text-secondary mt-1">{date}</p>
  </Link>
);
