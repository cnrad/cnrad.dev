import { lazy, Suspense } from "react";
import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./routes/layout";
import { NotFound } from "./routes/not-found";
import { RouteErrorFallback } from "./routes/route-error";
import { getWritingPost } from "./lib/writing";

const Home = lazy(() =>
  import("./routes/home").then((m) => ({ default: m.Home })),
);
const Art = lazy(() =>
  import("./routes/art").then((m) => ({ default: m.Art })),
);
const Craft = lazy(() =>
  import("./routes/craft").then((m) => ({ default: m.Craft })),
);
const More = lazy(() =>
  import("./routes/more").then((m) => ({ default: m.More })),
);

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Loader / layout-level errors that escape the in-page boundary surface as
    // a modal over a bare background. Page-content render errors are caught
    // closer to the source in Layout (PageErrorBoundary), keeping the chrome.
    // A missing URL is not an error — it falls through to the "*" 404 below.
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <Home />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/art",
        element: (
          <SuspenseWrapper>
            <Art />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/craft",
        element: (
          <SuspenseWrapper>
            <Craft />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/more",
        element: (
          <SuspenseWrapper>
            <More />
          </SuspenseWrapper>
        ),
      },
      {
        // Bare /writing isn't a page — bounce it to /more (where the writing
        // list lives). The loader redirects before anything renders.
        path: "/writing",
        loader: () => redirect("/more"),
      },
      {
        // The post itself renders as a full-screen overlay from the Layout
        // (see WritingOverlay); this route only needs to match the URL so the
        // Layout stays mounted underneath and doesn't fall through to NotFound.
        // The loader guards the slug: an unknown post throws a 404, which the
        // errorElement turns into the dedicated NotFound page (rather than
        // matching this route and rendering an empty overlay).
        path: "/writing/:slug",
        loader: ({ params }) => {
          if (!params.slug || !getWritingPost(params.slug)) {
            throw new Response("Not Found", { status: 404 });
          }
          return null;
        },
        element: null,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
