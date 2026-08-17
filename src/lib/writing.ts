// Writing posts live as markdown files in ../writing/*.md. Each file's name is
// its slug; frontmatter (--- fenced) supplies the display title and date. Vite
// inlines them at build time via import.meta.glob, so there's no runtime fetch.

export type WritingPost = {
  slug: string;
  title: string;
  /** Human-readable display date, e.g. "August 16, 2026". */
  date: string;
  content: string;
};

const modules = import.meta.glob("../writing/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw.trim() };

  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    data[key] = val;
  }

  return { data, content: raw.slice(match[0].length).trim() };
}

export const WRITING: WritingPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      content,
    };
  })
  // Newest first. Fall back to slug when a date is missing or unparseable.
  .sort((a, b) => {
    const da = Date.parse(a.date);
    const db = Date.parse(b.date);
    if (Number.isNaN(da) || Number.isNaN(db)) return a.slug.localeCompare(b.slug);
    return db - da;
  });

export function getWritingPost(slug: string): WritingPost | undefined {
  return WRITING.find((post) => post.slug === slug);
}
