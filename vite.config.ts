import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Two pages: / (story) and /menu/ (full menu, direct link for QR codes)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: { main: 'index.html', menu: 'menu/index.html' } } },
});
