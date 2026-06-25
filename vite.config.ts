import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/ice-etm-landing-004.github.io/',
  plugins: [tailwindcss()],
});
