import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["e4ca-2601-19b-4186-8c20-71f4-7157-b162-ba6d.ngrok-free.app"],
  },
});
