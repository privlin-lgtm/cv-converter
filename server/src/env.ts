import { existsSync } from 'node:fs'

const envFile = new URL('../.env', import.meta.url)
let loaded = false

// Loads server/.env once, if it exists. Variables already set in the environment win,
// so CI and the test config can override the file. A fallback makes the value optional.
export function requireEnv(name: string, fallback?: string): string {
  if (!loaded) {
    if (existsSync(envFile)) process.loadEnvFile(envFile)
    loaded = true
  }
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(`${name} is not set. Copy server/.env.example to server/.env and fill it in.`)
  }
  return value
}
