import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ disableOxcRecommendation: true }),
    {
      name: 'fix-rolldown-jsx-warning',
      configResolved(config) {
        if (config.optimizeDeps?.rollupOptions?.jsx) {
          delete config.optimizeDeps.rollupOptions.jsx;
        }
        if (config.optimizeDeps?.rolldownOptions?.jsx) {
          delete config.optimizeDeps.rolldownOptions.jsx;
        }
      },
    },
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
