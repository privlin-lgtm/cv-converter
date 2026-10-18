import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

afterAll(async () => {
  await db.destroy()
})

beforeEach(() => {
  vi.stubEnv('ANTHROPIC_MODEL', 'rating-test-model')
})

afterEach(async () => {
  vi.unstubAllEnvs()
  await db('ratings').del()
})

const valid = { from: 'IL', to: 'US', vsChatbot: 'better', score: 4, comment: 'Clear and quick.' }

const post = (body: object) => request(app).post('/api/ratings').send(body)

describe('POST /api/ratings', () => {
  it('stores the rating with the model from the environment and returns 201 { id }', async () => {
    const res = await post(valid)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: expect.any(Number) })
    const row = await db('ratings').where({ id: res.body.id }).first()
    expect(row).toMatchObject({
      from_code: 'IL',
      to_code: 'US',
      vs_chatbot: 'better',
      score: 4,
      comment: 'Clear and quick.',
      model: 'rating-test-model',
    })
  })

  it.each([{ comment: undefined }, { comment: '   ' }])('stores no comment as null (%o)', async (override) => {
    const res = await post({ ...valid, ...override })

    expect(res.status).toBe(201)
    const row = await db('ratings').where({ id: res.body.id }).first()
    expect(row.comment).toBeNull()
  })

  it('accepts a comment of exactly 500 characters', async () => {
    const res = await post({ ...valid, comment: 'a'.repeat(500) })

    expect(res.status).toBe(201)
  })

  it.each(['from', 'to', 'vsChatbot', 'score'])('returns 400 when %s is missing', async (field) => {
    const res = await post({ ...valid, [field]: undefined })

    expect(res.status).toBe(400)
  })

  it.each([
    { score: 6 },
    { score: 0 },
    { score: 3.5 },
    { score: '4' },
    { comment: 'a'.repeat(501) },
    { from: 'FR' },
    { to: 'FR' },
    { vsChatbot: 'meh' },
    { model: 'sent-by-the-client' },
    { text: 'FICTIONAL TEST CV — NOT A REAL PERSON' },
  ])('returns 400 and stores nothing for %o', async (override) => {
    const res = await post({ ...valid, ...override })

    expect(res.status).toBe(400)
    expect(await db('ratings')).toHaveLength(0)
  })
})
