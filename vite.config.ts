import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/listening-avatar-gemini/",
  server: {
    proxy: {
      '/api/ttsopenai': {
        target: 'https://api.ttsopenai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ttsopenai/, '/uapi/v1/text-to-speech'),
      },
    },
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}));


