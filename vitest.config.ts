/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
  ],
  resolve: {
    alias: {
      '@ngstarter-ui/components': path.resolve(__dirname, './projects/components'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
