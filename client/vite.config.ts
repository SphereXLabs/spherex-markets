import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site needs `/spherex-markets/`; local/Docker use relative `./`.
const base = process.env.GITHUB_ACTIONS ? '/spherex-markets/' : './';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
