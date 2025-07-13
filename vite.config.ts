import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: parseInt(env.VITE_PORT) || 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3333',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: env.VITE_WS_BASE_URL || 'ws://localhost:3333',
          ws: true,
          changeOrigin: true,
        },
      },
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
    define: {
      // Make sure environment variables are available in the app
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3333'),
      __VITE_WS_BASE_URL__: JSON.stringify(env.VITE_WS_BASE_URL || 'ws://localhost:3333'),
    },
  };
});
