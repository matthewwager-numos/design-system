import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // BASE_PATH is set by CI for GitHub Pages; falls back to "/" locally
  base: process.env.BASE_PATH ?? "/",
  server: { port: 5174, open: true },
});
