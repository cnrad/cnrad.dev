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
  let lenis: Lenis | null = null;

  function createLenis() {
    const instance = new Lenis({
      lerp: 0.16,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    lenis = instance;
    (window as any).__lenis = instance;

    // Each raf loop is bound to its instance and stops once superseded,
    // so recreating Lenis never leaves two loops driving it at once.
    function raf(time: number) {
      if (lenis !== instance) return;
      instance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function destroyLenis() {
    lenis?.destroy();
    lenis = null;
    (window as any).__lenis = null;
  }

  createLenis();

  // When the page is pinch-zoomed (visual viewport scale > 1), Lenis hijacks
  // the wheel and you can't pan around the zoomed view. Tear it down while
  // zoomed so native panning works, and bring it back at 100%.
  const vv = window.visualViewport;
  if (vv) {
    const syncZoomState = () => {
      const zoomed = vv.scale > 1.01;
      if (zoomed && lenis) destroyLenis();
      else if (!zoomed && !lenis) createLenis();
    };
    vv.addEventListener("resize", syncZoomState);
  }
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
