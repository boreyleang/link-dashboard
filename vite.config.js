import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Local UI development server.
 * Open http://localhost:5173/newtab/ — uses localStorage (not chrome.storage).
 * For real extension behavior: npm run chrome
 */
export default defineConfig({
  root: rootDir,
  publicDir: false,
  server: {
    port: 5173,
    strictPort: true,
    open: '/newtab/index.html',
    host: true,
  },
  preview: {
    port: 4173,
    open: '/newtab/index.html',
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: path.resolve(rootDir, 'newtab/index.html'),
      },
    },
  },
});
