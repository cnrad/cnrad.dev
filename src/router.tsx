import { createBrowserRouter } from "react-router";
import { Layout } from "./routes/layout";
import { Home } from "./routes/home";
import { Art } from "./routes/art";
import { Craft } from "./routes/craft";
import { More } from "./routes/more";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/art", element: <Art /> },
      { path: "/craft", element: <Craft /> },
      { path: "/more", element: <More /> },
    ],
  },
]);
