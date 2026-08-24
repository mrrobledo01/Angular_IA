import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://99.0.5.213:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
