import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer() as unknown as PluginOption, // Cast to unknown first
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis", // Define global to resolve the ReferenceError
    "process.env": {}, // Define process.env to prevent errors
  },
});
