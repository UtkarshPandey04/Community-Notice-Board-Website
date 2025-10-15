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
    allowedHosts: [
      'terrie-subepithelial-ruthie.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your local backend server
        changeOrigin: true,
      }
    }
  }
  ,
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
