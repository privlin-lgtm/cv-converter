import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

afterAll(async () => {
  await db.destroy()
})

describe('GET /api/countries', () => {
  it('returns the four countries', async () => {
    const res = await request(app).get('/api/countries')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { code: 'DE', name: 'Germany', documentName: 'Curriculum Vitae (Lebenslauf)', paperSize: 'A4' },
      { code: 'IL', name: 'Israel', documentName: 'CV', paperSize: 'A4' },
      { code: 'GB', name: 'United Kingdom', documentName: 'CV', paperSize: 'A4' },
      { code: 'US', name: 'United States', documentName: 'Résumé', paperSize: 'Letter' },
    ])
  })
})

describe('GET /api/countries/:code/norms', () => {
  it.each(['US', 'GB', 'DE', 'IL'])('%s has its key rules', async (code) => {
    const res = await request(app).get(`/api/countries/${code}/norms`)
    expect(res.status).toBe(200)
    const keys: string[] = res.body.map((norm: { key: string }) => norm.key)
    expect(keys).toEqual(expect.arrayContaining(['date_format', 'length_pages']))
    expect(keys.includes('photo') || keys.includes('date_of_birth')).toBe(true)
  })

  it('returns the public fields of each rule, with the date as YYYY-MM-DD', async () => {
    const res = await request(app).get('/api/countries/US/norms')
    const photo = res.body.find((norm: { key: string }) => norm.key === 'photo')
    expect(photo).toEqual({
      key: 'photo',
      rule: 'Remove any photo, headshot or image of the candidate.',
      why: 'US employers avoid photos because they reveal protected traits. EEOC says employers should not ask for one before an offer.',
      sources: ['https://www.eeoc.gov/prohibited-employment-policiespractices', 'https://career.unm.edu/career-tools/resumeguide2024.pdf'],
      status: 'confirmed',
      verifiedOn: '2026-10-10',
    })
  })

  it('copies army rows to US, GB and DE but not IL', async () => {
    for (const code of ['US', 'GB', 'DE']) {
      const res = await request(app).get(`/api/countries/${code}/norms`)
      expect(res.body.map((norm: { key: string }) => norm.key)).toContain('military_jargon')
    }
    const il = await request(app).get('/api/countries/IL/norms')
    expect(il.body.map((norm: { key: string }) => norm.key)).not.toContain('military_jargon')
  })

  it('returns 404 for an unknown code', async () => {
    const res = await request(app).get('/api/countries/FR/norms')
    expect(res.status).toBe(404)
  })
})
