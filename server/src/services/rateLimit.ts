import { createHmac } from 'node:crypto'
import { z } from 'zod'
import { db } from '../db.js'
import { requireEnv } from '../env.js'

export type RateLimitScope = 'convert' | 'ratings' | 'convert_total'

const positiveInt = z.coerce.number().int().positive()

const scopes = {
  convert: { limitEnv: 'RATE_LIMIT_CONVERT', defaultLimit: '10', perClient: true },
  ratings: { limitEnv: 'RATE_LIMIT_RATINGS', defaultLimit: '30', perClient: true },
  convert_total: { limitEnv: 'RATE_LIMIT_CONVERT_DAILY_TOTAL', defaultLimit: '200', perClient: false },
} as const

export interface RateLimitResult {
  allowed: boolean
  limit: number
  windowMinutes: number
  retryAfterSeconds: number
}

export async function recordHit(scope: RateLimitScope, clientIp: string, now = new Date()): Promise<RateLimitResult> {
  const { limitEnv, defaultLimit, perClient } = scopes[scope]
  const limit = positiveInt.parse(requireEnv(limitEnv, defaultLimit))
  const windowMinutes = perClient ? positiveInt.parse(requireEnv('RATE_LIMIT_WINDOW_MINUTES', '60')) : 24 * 60
  const windowMs = windowMinutes * 60_000
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs)
  const clientHash = perClient ? createHmac('sha256', requireEnv('RATE_LIMIT_SALT')).update(clientIp).digest('hex') : 'all'

  await db('rate_limits').where({ scope }).andWhere('window_start', '<', windowStart).del()
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
