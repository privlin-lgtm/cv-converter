import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'node:fs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'
import type { ModelOutput } from '../src/schemas/modelOutput.js'
import type { SendMessage } from '../src/services/model.js'
import { recordHit } from '../src/services/rateLimit.js'

afterAll(async () => {
  await db.destroy()
})

beforeEach(() => {
  vi.stubEnv('RATE_LIMIT_CONVERT', '2')
  vi.stubEnv('RATE_LIMIT_RATINGS', '1')
  vi.stubEnv('RATE_LIMIT_WINDOW_MINUTES', '60')
  vi.stubEnv('ANTHROPIC_MODEL', 'rate-limit-test-model')
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(async () => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  await db('ratings').del()
  await db('rate_limits').del()
})

const cvText = readFileSync(new URL('./fixtures/il-software-dev.txt', import.meta.url), 'utf8')

const output: ModelOutput = {
  cv: { header: { name: 'Noa Ben-Ari', headline: 'Backend Developer', contactLines: [] }, sections: [] },
  changes: [],
  questions: [],
  notes: [],
}

function fakeModel() {
  let calls = 0
  const send: SendMessage = async () => {
    calls += 1
    return {
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: 'fake-model',
      content: [{ type: 'text', text: JSON.stringify(output), citations: null }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 1000, output_tokens: 500 },
    } as unknown as Anthropic.Message
  }
  return { send, calls: () => calls }
}

const convertBody = { from: 'IL', to: 'US', text: cvText }
const ratingBody = { from: 'IL', to: 'US', vsChatbot: 'better', score: 4 }

describe('rate limit on POST /api/convert', () => {
  it('returns 429 with a clear message and Retry-After once the limit is spent, without calling the model', async () => {
    const model = fakeModel()
    const app = createApp({ send: model.send, model: 'fake-model' })

    expect((await request(app).post('/api/convert').send(convertBody)).status).toBe(200)
    expect((await request(app).post('/api/convert').send(convertBody)).status).toBe(200)
    const res = await request(app).post('/api/convert').send(convertBody)

    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/^Too many requests: the limit is 2 conversions every 60 minutes\. Try again in \d+ minutes?\.$/)
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0)
    expect(Number(res.headers['retry-after'])).toBeLessThanOrEqual(3600)
    expect(model.calls()).toBe(2)
  })

  it('counts each client IP on its own when a proxy is trusted', async () => {
    vi.stubEnv('TRUST_PROXY_HOPS', '1')
    vi.stubEnv('RATE_LIMIT_CONVERT', '1')
    const model = fakeModel()
    const app = createApp({ send: model.send, model: 'fake-model' })
    const from = (ip: string) => request(app).post('/api/convert').set('X-Forwarded-For', ip).send(convertBody)

    expect((await from('203.0.113.1')).status).toBe(200)
    expect((await from('203.0.113.1')).status).toBe(429)
    expect((await from('203.0.113.2')).status).toBe(200)
  })

  it('stores only a hash of the IP and a counter, never the CV', async () => {
    vi.stubEnv('TRUST_PROXY_HOPS', '1')
    const app = createApp({ send: fakeModel().send, model: 'fake-model' })
    await request(app).post('/api/convert').set('X-Forwarded-For', '203.0.113.9').send(convertBody)

    const rows = await db('rate_limits').where({ scope: 'convert' })
    expect(rows).toHaveLength(1)
    expect(Object.keys(rows[0]).sort()).toEqual(['client_hash', 'hits', 'scope', 'window_start'])
    expect(rows[0]).toMatchObject({ scope: 'convert', hits: 1 })
    expect(rows[0].client_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(await db('rate_limits'))).not.toContain('203.0.113.9')
  })
})

describe('rate limit on POST /api/ratings', () => {
  it('returns 429 once the ratings limit is spent and stores no extra rating', async () => {
    const app = createApp()

    expect((await request(app).post('/api/ratings').send(ratingBody)).status).toBe(201)
    const res = await request(app).post('/api/ratings').send(ratingBody)

    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/^Too many requests: the limit is 1 ratings every 60 minutes\./)
    expect(await db('ratings')).toHaveLength(1)
  })

  it('keeps the convert and ratings counters apart', async () => {
    const app = createApp({ send: fakeModel().send, model: 'fake-model' })

    expect((await request(app).post('/api/ratings').send(ratingBody)).status).toBe(201)
    expect((await request(app).post('/api/convert').send(convertBody)).status).toBe(200)
  })
})

describe('recordHit', () => {
  it('starts a new window when the old one ends and deletes the expired rows', async () => {
    const first = await recordHit('convert', '198.51.100.7', new Date('2026-10-29T10:59:00Z'))
    await recordHit('convert', '198.51.100.7', new Date('2026-10-29T10:59:30Z'))
    const blocked = await recordHit('convert', '198.51.100.7', new Date('2026-10-29T10:59:59Z'))
    const next = await recordHit('convert', '198.51.100.7', new Date('2026-10-29T11:00:00Z'))

    expect(first).toEqual({ allowed: true, limit: 2, windowMinutes: 60, retryAfterSeconds: 60 })
    expect(blocked).toMatchObject({ allowed: false, retryAfterSeconds: 1 })
    expect(next).toEqual({ allowed: true, limit: 2, windowMinutes: 60, retryAfterSeconds: 3600 })
    expect(await db('rate_limits')).toHaveLength(1)
  })

  it('throws when a limit in the environment is not a positive whole number', async () => {
    vi.stubEnv('RATE_LIMIT_CONVERT', 'ten')

    await expect(recordHit('convert', '198.51.100.7')).rejects.toThrow()
  })
})

describe('daily cap on all conversions', () => {
  it('returns 429 across every client once the daily total is spent, until the next UTC day', async () => {
    vi.stubEnv('TRUST_PROXY_HOPS', '1')
    vi.stubEnv('RATE_LIMIT_CONVERT_DAILY_TOTAL', '2')
    const model = fakeModel()
    const app = createApp({ send: model.send, model: 'fake-model' })
    const from = (ip: string) => request(app).post('/api/convert').set('X-Forwarded-For', ip).send(convertBody)

    expect((await from('203.0.113.11')).status).toBe(200)
    expect((await from('203.0.113.12')).status).toBe(200)
    const res = await from('203.0.113.13')

    expect(res.status).toBe(429)
    expect(res.body.error).toBe('The app has reached its daily limit of 2 conversions. Try again tomorrow.')
    expect(Number(res.headers['retry-after'])).toBeLessThanOrEqual(24 * 60 * 60)
    expect(model.calls()).toBe(2)
    expect(await db('rate_limits').where({ scope: 'convert_total' })).toMatchObject([{ client_hash: 'all', hits: 3 }])
  })

  it('resets at midnight UTC and survives the hourly cleanup of per-client rows', async () => {
    vi.stubEnv('RATE_LIMIT_CONVERT_DAILY_TOTAL', '1')
    await recordHit('convert_total', '198.51.100.7', new Date('2026-10-29T08:00:00Z'))
    await recordHit('convert', '198.51.100.7', new Date('2026-10-29T23:30:00Z'))
    const blocked = await recordHit('convert_total', '198.51.100.7', new Date('2026-10-29T23:59:00Z'))
    const next = await recordHit('convert_total', '198.51.100.7', new Date('2026-10-30T00:00:00Z'))

    expect(blocked).toEqual({ allowed: false, limit: 1, windowMinutes: 1440, retryAfterSeconds: 60 })
    expect(next).toMatchObject({ allowed: true, retryAfterSeconds: 86_400 })
  })
})
