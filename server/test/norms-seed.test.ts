import { afterAll, describe, expect, it } from 'vitest'
import { db } from '../src/db.js'
import { checkDefSchema } from '../src/schemas/checkDef.js'

afterAll(async () => {
  await db.destroy()
})

describe('norms seed', () => {
  it('seeds the rules for every country', async () => {
    const rows = await db('norms')
      .select('country_code')
      .count('* as count')
      .groupBy('country_code')
      .orderBy('country_code')
    expect(rows).toEqual([
      { country_code: 'DE', count: '34' },
      { country_code: 'GB', count: '36' },
      { country_code: 'IL', count: '34' },
      { country_code: 'US', count: '38' },
    ])
  })

  it('every check_def parses against the four check types', async () => {
    const rows: { country_code: string; key: string; check_def: unknown }[] = await db('norms')
      .whereNotNull('check_def')
      .select('country_code', 'key', 'check_def')
    expect(rows).toHaveLength(27)
    const failures = rows
      .filter((row) => !checkDefSchema.safeParse(row.check_def).success)
      .map((row) => `${row.country_code}:${row.key}`)
    expect(failures).toEqual([])
  })

  it('rejects an unknown check type and an invalid pattern', () => {
    expect(checkDefSchema.safeParse({ type: 'min_words', max: 10 }).success).toBe(false)
    expect(checkDefSchema.safeParse({ type: 'absent', pattern: '(' }).success).toBe(false)
  })
})
