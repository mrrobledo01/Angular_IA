import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://99.0.3.8:8002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
