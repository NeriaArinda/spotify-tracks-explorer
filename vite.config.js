import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` lets the built site be served from GitHub Pages at /spotify-tracks-explorer/.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: { environment: 'node' },
});
