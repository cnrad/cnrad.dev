import { PageContent } from "@/components/PageContent";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogContent } from "@/components/blog/BlogWrapper";
import { InterfaceDesign } from "@/components/blog/posts/InterfaceDesign";
import { MeasurableDifference } from "@/components/blog/posts/MeasurableDifference";
import { TinyWings } from "@/components/blog/posts/TinyWings";
import { AnimatePresence, motion } from "motion/react";
import { ComponentPropsWithRef, useRef, useState } from "react";

const POSTS = [
  {
    slug: "a-different-approach-to-interface-design",
    title: "A different approach to interface design",
    description:
      "Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of",
    date: "02/17/25",
    content: <InterfaceDesign />,
  },
  {
    slug: "measurable-difference",
    title: "Why is measurable difference so difficult?",
    description:
      "Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of",
    date: "01/24/25",
    content: <MeasurableDifference />,
  },
  {
    slug: "tiny-wings",
    title: "Why Tiny Wings is a *perfect* mobile game",
    description:
      "Lorem ipsum about an article here, but it cuts off for some reason I'm not sure of",
    date: "01/24/25",
    content: <TinyWings />,
  },
];

export default function Blog() {
  const [currentPost, setCurrentPost] = useState<string | null>(null);

  type BlogRef = HTMLButtonElement | null;
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
            i don&apos;t think of myself as that great of a writer - but
            occasionally i&apos;ll write about things i find interesting.
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
                onClick={() => setCurrentPost(post.slug)}
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
              {POSTS.find((e) => e.slug === currentPost)?.content}
            </BlogContent>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </PageWrapper>
  );
}

// TODO: figure out stupid layout and route shit so i can just use Link
const BlogPostItem = ({
  // slug,
  title,
  date,
  description,
  onClick,
  ...rest
}: {
  slug: string;
  title: string;
  date: string;
  description: string;
  onClick?: () => void;
} & ComponentPropsWithRef<"button">) => (
  <button
    // href={`/blog/${slug}`}
    // shallow
    onClick={onClick}
    className="flex flex-col group cursor-pointer"
    {...rest}
  >
    <h5 className="text-primary font-medium">{title}</h5>
    <p className="text-secondary truncate max-w-full">{description}</p>
    <p className="font-light italic text-secondary mt-1">{date}</p>
  </button>
);
