import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

// Per-post <head> tags for link crawlers. The site is client-rendered, so a
// crawler asking for /writing/<slug> would otherwise see the generic shell.
//
// Build: for every post in src/writing, writes dist/writing/<slug>.html — the
// built index.html with the title and card tags swapped for the post's, and
// the description tags removed, so the card is just the title. Cloudflare Pages serves extensionless HTML, so /writing/<slug> gets
// that file (same bundle, same app, only the head differs) and everything else
// still falls through to index.html.
//
// Dev: the same swap is applied to the shell when the dev server is asked for
// /writing/<slug>, so a tunnel plus an embed checker shows the real tags.

const SITE = "https://cnrad.dev";
const AUTHOR = "Conrad Crawford";

type Post = { slug: string; title: string };

function readPosts(root: string): Post[] {
  const dir = join(root, "src/writing");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8");
      const slug = f.replace(/\.md$/, "");
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
      let title = slug;
      if (fm) {
        const t = /^title:\s*(.+)$/m.exec(fm[1] ?? "");
        if (t) title = (t[1] ?? "").trim().replace(/^["']|["']$/g, "");
      }
      return { slug, title };
    });
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function swapHead(html: string, post: Post) {
  const title = esc(`${post.title} - ${AUTHOR}`);
  const url = `${SITE}/writing/${post.slug}`;
  const set = (h: string, re: RegExp, val: string) => h.replace(re, (m) => m.replace(/content="[^"]*"/, `content="${val}"`));
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  // no description on a post: the card is the title alone
  out = out.replace(/[ \t]*<meta (?:name="description"|property="og:description"|name="twitter:description") content="[^"]*" \/>\r?\n/g, "");
  out = set(out, /<meta property="og:title" content="[^"]*" \/>/, esc(post.title));
  out = set(out, /<meta property="og:type" content="[^"]*" \/>/, "article");
  out = set(out, /<meta property="og:url" content="[^"]*" \/>/, url);
  out = set(out, /<meta name="twitter:title" content="[^"]*" \/>/, esc(post.title));
  return out;
}

export function postMeta(): Plugin {
  let root = process.cwd();
  let outDir = "dist";
  return {
    name: "post-meta",
    enforce: "post",
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/writing\/([^/?#]+)\/?(?:[?#].*)?$/.exec(req.url ?? "");
        if (!m || req.method !== "GET" || !(req.headers.accept ?? "").includes("text/html")) return next();
        const post = readPosts(root).find((p) => p.slug === m[1]);
        if (!post) return next();
        const shell = readFileSync(join(root, "index.html"), "utf8");
        const html = swapHead(await server.transformIndexHtml(req.url!, shell), post);
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      });
    },
    closeBundle() {
      const dist = join(root, outDir);
      const shellPath = join(dist, "index.html");
      if (!existsSync(shellPath)) return;
      const shell = readFileSync(shellPath, "utf8");
      const dir = join(dist, "writing");
      mkdirSync(dir, { recursive: true });
      for (const post of readPosts(root)) {
        writeFileSync(join(dir, `${post.slug}.html`), swapHead(shell, post));
      }
    },
  };
}
