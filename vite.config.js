// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';

export default defineConfig(({ mode }) => ({
  plugins: [
    // ...(mode === 'development'
    //   ? [viteSourceLocator({ prefix: 'mgx' })]
    //   : []),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://community-notice-board-website.vercel.app/', // Express backend
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development' ? true : 'hidden',
    emptyOutDir: true,
  },
  base: mode === 'production' ? '/' : '/',
  define: {
    __APP_ENV__: JSON.stringify(mode),
  },
}));
