import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true
  },
});