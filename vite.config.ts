import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mini-game/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blockgame: resolve(__dirname, 'blockgame/index.html'),
        counter: resolve(__dirname, 'counter/index.html'),
        shooter: resolve(__dirname, 'shooter/index.html'),
      },
    },
  },
});
