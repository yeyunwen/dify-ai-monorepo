import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  format: ['cjs', 'esm'],
  outExtensions: (context) => {
    if (context.format === 'cjs') {
      return { js: '.cjs', dts: '.ts' };
    }
    if (context.format === 'es') {
      return { js: '.mjs', dts: '.ts' };
    }
  },
  dts: true,
});
