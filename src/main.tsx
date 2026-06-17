import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Lenis from "lenis";
import { router } from "./router";
import { preloadCraftVideos } from "./lib/preload";
import "./app.css";

// Only initialize Lenis on non-touch devices. On mobile, Lenis hijacks the
// document scroll and prevents Safari's liquid glass toolbar from letting
// content extend behind it. Native scroll is also smoother on touch anyway.
const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!isTouch && !prefersReducedMotion) {
  const lenis = new Lenis({
    lerp: 0.16,
    smoothWheel: true,
    wheelMultiplier: 0.95,
  });

  (window as any).__lenis = lenis;

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

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
