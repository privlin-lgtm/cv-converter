import { afterAll, describe, expect, it } from 'vitest'
import { db } from '../src/db.js'
import { checkDefSchema, type CheckDef } from '../src/schemas/checkDef.js'
import type { Cv } from '../src/schemas/modelOutput.js'
import { runCheck } from '../src/services/checks.js'

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

  it('the German language-level check flags a percentage level but not a percentage elsewhere', async () => {
    const row: { check_def: CheckDef } = await db('norms')
      .where({ country_code: 'DE', key: 'language_levels' })
      .first('check_def')
    const cvWith = (bullet: string, language: string): Cv => ({
      header: { name: 'Dana Example', headline: '', contactLines: [] },
      sections: [
        { kind: 'experience', heading: 'Experience', text: '', entries: [{ dates: '', title: '', organisation: '', location: '', lines: [bullet] }] },
        { kind: 'languages', heading: 'Languages', text: language, entries: [] },
      ],
    })

    expect(runCheck('language_levels', row.check_def, cvWith('Cut idle hours by about 20%', 'English – good')).result).toBe('pass')
    expect(runCheck('language_levels', row.check_def, cvWith('Cut idle hours by 20%', 'English – 90%')).result).toBe('flagged')
    expect(runCheck('language_levels', row.check_def, cvWith('Cut idle hours', 'English ★★★★☆')).result).toBe('flagged')
  })

  it('rejects an unknown check type and an invalid pattern', () => {
    expect(checkDefSchema.safeParse({ type: 'min_words', max: 10 }).success).toBe(false)
    expect(checkDefSchema.safeParse({ type: 'absent', pattern: '(' }).success).toBe(false)
  })
})
