import { useRouter } from "next/router";
import { POSTS } from "..";
import { BlogContent } from "@/components/blog/BlogWrapper";
import { PageWrapper } from "@/components/PageWrapper";

export default function BlogPost() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const post = POSTS.find((post) => post.slug === slug);

  return (
    <PageWrapper>
      {post ? (
        <BlogContent key={post.slug}>
          {POSTS.find((e) => e.slug === post.slug)?.content}
        </BlogContent>
      ) : null}
    </PageWrapper>
  );
}
