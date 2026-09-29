import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { postMeta } from "./vite-post-meta";

export default defineConfig({
  plugins: [react(), tailwindcss(), postMeta()],
  server: {
    // any host so my tunnels just work
    allowedHosts: true,
  },
});
