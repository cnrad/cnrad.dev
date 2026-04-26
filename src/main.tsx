import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Lenis from "lenis";
import { router } from "./router";
import "./app.css";

// Only initialize Lenis on non-touch devices. On mobile, Lenis hijacks the
// document scroll and prevents Safari's liquid glass toolbar from letting
// content extend behind it. Native scroll is also smoother on touch anyway.
const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

if (!isTouch) {
  const lenis = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    wheelMultiplier: 0.8,
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
