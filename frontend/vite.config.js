import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    https: false,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    port: 5173,
    open: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      overlay: true,
    },
  },

  //  Build optimizations (mostly for production)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons', 'react-toastify'],
          utils: ['axios', 'exceljs', 'file-saver'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssMinify: true,
    minify: 'esbuild', //  esbuild is much faster than terser in dev & prod
  },

  //  Dependency pre-bundling (affects dev speed)
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons',
      'react-toastify',
      'axios',
      'exceljs',
    ],
  },
});
