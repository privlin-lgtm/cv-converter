import { defineConfig } from 'vitest/config'
import { requireEnv } from './src/env.js'

// Every test file, and the global setup, talks to the test database, never the dev one.
process.env.DATABASE_URL = requireEnv('DATABASE_URL_TEST')

export default defineConfig({
  test: {
    globalSetup: ['./test/globalSetup.ts'],
    fileParallelism: false,
  },
})
