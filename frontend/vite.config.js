import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tailwind v3 runs via PostCSS (see `postcss.config.js`), not the Tailwind v4 Vite plugin.
export default defineConfig({
  plugins: [react()],
});
