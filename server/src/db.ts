import knex from 'knex'
import { fileURLToPath } from 'node:url'
import { requireEnv } from './env.js'

const dbDir = fileURLToPath(new URL('../db/', import.meta.url))

export const db = knex({
  client: 'pg',
  connection: requireEnv('DATABASE_URL'),
  migrations: { directory: `${dbDir}migrations`, loadExtensions: ['.ts'] },
  seeds: { directory: `${dbDir}seeds`, loadExtensions: ['.ts'] },
})
