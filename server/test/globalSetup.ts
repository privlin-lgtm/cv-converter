import { db } from '../src/db.js'

// Brings the test database up to date before any test file runs.
export default async function setup() {
  try {
    await db.migrate.latest()
    await db.seed.run()
  } finally {
    await db.destroy()
  }
}
