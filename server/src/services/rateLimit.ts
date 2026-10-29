import { createHmac } from 'node:crypto'
import { z } from 'zod'
import { db } from '../db.js'
import { requireEnv } from '../env.js'

export type RateLimitScope = 'convert' | 'ratings'

const limitEnv = {
  convert: { name: 'RATE_LIMIT_CONVERT', fallback: '10' },
  ratings: { name: 'RATE_LIMIT_RATINGS', fallback: '30' },
} as const

const positiveInt = z.coerce.number().int().positive()

export interface RateLimitResult {
  allowed: boolean
  limit: number
  windowMinutes: number
  retryAfterSeconds: number
}

export async function recordHit(scope: RateLimitScope, clientIp: string, now = new Date()): Promise<RateLimitResult> {
  const { name, fallback } = limitEnv[scope]
  const limit = positiveInt.parse(requireEnv(name, fallback))
  const windowMinutes = positiveInt.parse(requireEnv('RATE_LIMIT_WINDOW_MINUTES', '60'))
  const windowMs = windowMinutes * 60_000
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs)
  const clientHash = createHmac('sha256', requireEnv('RATE_LIMIT_SALT')).update(clientIp).digest('hex')

  await db('rate_limits').where('window_start', '<', windowStart).del()
  const [{ hits }] = await db('rate_limits')
    .insert({ scope, client_hash: clientHash, window_start: windowStart, hits: 1 })
    .onConflict(['scope', 'client_hash', 'window_start'])
    .merge({ hits: db.raw('rate_limits.hits + 1') })
    .returning('hits')

  return {
    allowed: hits <= limit,
    limit,
    windowMinutes,
    retryAfterSeconds: Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000),
  }
}
