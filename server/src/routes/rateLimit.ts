import type { RequestHandler } from 'express'
import { recordHit, type RateLimitScope } from '../services/rateLimit.js'

const noun = { convert: 'conversions', ratings: 'ratings' }

export function rateLimit(scope: RateLimitScope): RequestHandler {
  return async (req, res, next) => {
    const { allowed, limit, windowMinutes, retryAfterSeconds } = await recordHit(scope, req.ip ?? 'unknown')
    if (allowed) {
      next()
      return
    }
    const wait = Math.ceil(retryAfterSeconds / 60)
    res.set('Retry-After', String(retryAfterSeconds))
    res.status(429).json({
      error: `Too many requests: the limit is ${limit} ${noun[scope]} every ${windowMinutes} minutes. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`,
    })
  }
}
