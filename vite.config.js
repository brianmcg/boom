import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@util': '/src/util',
      '@constants': '/src/constants',
      '@game': '/src/App/components/Game',
    },
  },
});
