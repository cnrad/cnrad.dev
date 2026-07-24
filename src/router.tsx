import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./routes/layout";
import { NotFound } from "./routes/not-found";

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
    errorElement: <NotFound />,
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
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
