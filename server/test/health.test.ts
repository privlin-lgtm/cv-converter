import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

afterAll(async () => {
  await db.destroy()
})

describe('GET /api/health', () => {
  it('returns 200 when the database is reachable', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, db: true })
  })
})
