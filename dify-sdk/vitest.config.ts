import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/unit/**/*.test.ts'],
    setupFiles: ['./__tests__/setupTests.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    typecheck: {
      enabled: true,
      checker: 'tsc',
    },
  },
});
