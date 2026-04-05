import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Lenis from "lenis";
import { router } from "./router";
import "./app.css";

const lenis = new Lenis({
  lerp: 0.12,
  smoothWheel: true,
  wheelMultiplier: 0.8,
});

// Expose for components that need to temporarily disable smooth scrolling
(window as any).__lenis = lenis;

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
