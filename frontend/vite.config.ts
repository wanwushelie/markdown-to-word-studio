import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const isBrowserPublic = mode === 'browser-public';

  return {
    base: isBrowserPublic ? './' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        sharp: '/src/browser-stubs/sharp.ts',
        'node:fs/promises': '/src/browser-stubs/fs-promises.ts',
      },
    },
    define: {
      'import.meta.env.VITE_RUNTIME_TARGET': JSON.stringify(isBrowserPublic ? 'browser-public' : 'server'),
    },
    build: {
      outDir: isBrowserPublic ? 'dist' : '../public',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1400,
    },
    server: isBrowserPublic
      ? undefined
      : {
          proxy: {
            '/api': 'http://localhost:3000',
            '/wopi': 'http://localhost:3000',
          },
        },
  };
});
