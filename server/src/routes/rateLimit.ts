import type { RequestHandler } from 'express'
import { recordHit, type RateLimitScope } from '../services/rateLimit.js'

function message(scope: RateLimitScope, limit: number, windowMinutes: number, retryAfterSeconds: number) {
  if (scope === 'convert_total') {
    return `The app has reached its daily limit of ${limit} conversions. Try again tomorrow.`
  }
  const wait = Math.ceil(retryAfterSeconds / 60)
  const noun = scope === 'convert' ? 'conversions' : 'ratings'
  return `Too many requests: the limit is ${limit} ${noun} every ${windowMinutes} minutes. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`
}

export function rateLimit(scope: RateLimitScope): RequestHandler {
  return async (req, res, next) => {
    const { allowed, limit, windowMinutes, retryAfterSeconds } = await recordHit(scope, req.ip ?? 'unknown')
    if (allowed) {
      next()
      return
    }
    res.set('Retry-After', String(retryAfterSeconds))
    res.status(429).json({ error: message(scope, limit, windowMinutes, retryAfterSeconds) })
  }
}
