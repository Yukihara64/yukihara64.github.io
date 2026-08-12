import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true
  },
  preview: {
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      }
    }
  }
});
