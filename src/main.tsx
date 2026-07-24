import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { preloadCraftVideos } from "./lib/preload";
import "./app.css";

// Scrolling is native. A JS scroll-smoothing library (Lenis) used to live here,
// but driving the scroll position from the main thread every frame forced
// Safari to repaint the fixed, SVG-filtered noise layer on every frame, which
// made the whole page scroll stutter. Native scroll keeps fixed layers on the
// GPU; macOS trackpad momentum already reads as smooth.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Preload craft videos in the background once the main thread is idle
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => preloadCraftVideos());
} else {
  setTimeout(preloadCraftVideos, 1000);
}
