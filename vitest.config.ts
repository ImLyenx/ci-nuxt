import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'web',
          include: ['web/test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'api',
          include: ['api/test/**/*.test.ts'],
          setupFiles: ['api/test/setup.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      include: [
        'api/src/**/*.ts',
        'web/app/utils/**/*.ts',
        'web/server/utils/**/*.ts',
        'web/shared/**/*.ts',
      ],
      exclude: ['api/src/index.ts', 'api/src/lambda.ts'],
      reporter: ['text', 'html', 'json-summary', 'json'],
      reportOnFailure: true,
    },
  },
})
