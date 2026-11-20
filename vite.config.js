import { defineConfig } from 'vite';

// Relative asset URLs work both at / and /repository-name/ on GitHub Pages.
export default defineConfig({
  base: './',
  build: { outDir: 'dist' }
});
