import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'  // la tua riga esistente
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // porta backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
