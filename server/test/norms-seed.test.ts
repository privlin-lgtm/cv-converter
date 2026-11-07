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

  it.each(['US', 'GB'])('the %s date check flags year-only and numeric dates and accepts Mon YYYY with Present', async (code) => {
    const row: { check_def: CheckDef } = await db('norms')
      .where({ country_code: code, key: 'date_format' })
      .first('check_def')
    const cvWith = (dates: string[]): Cv => ({
      header: { name: 'Dana Example', headline: '', contactLines: [] },
      sections: [
        {
          kind: 'experience',
          heading: 'Experience',
          text: '',
          entries: dates.map((value) => ({ dates: value, title: '', organisation: '', location: '', lines: [] })),
        },
      ],
    })

    expect(row.check_def.type).toBe('all_dates_match')
    expect(runCheck('date_format', row.check_def, cvWith(['Mar 2021 – Aug 2024', 'Sep 2024 – Present'])).result).toBe('pass')
    expect(runCheck('date_format', row.check_def, cvWith(['2021 – 2024'])).result).toBe('flagged')
    expect(runCheck('date_format', row.check_def, cvWith(['03/2021 – 08/2024'])).result).toBe('flagged')
    expect(runCheck('date_format', row.check_def, cvWith(['Mar 2021 – Aug 2024', '2019'])).result).toBe('flagged')
  })

  const personalCv = (lines: string[]): Cv => ({
    header: { name: 'Dana Example', headline: '', contactLines: ['dana@example.com'] },
    sections: [{ kind: 'personal_details', heading: 'Personal', text: '', entries: [{ dates: '', title: '', organisation: '', location: '', lines }] }],
  })
  const statusRows = [
    ['US', 'personal_status'],
    ['GB', 'marital_status_gender'],
    ['DE', 'marital_status'],
    ['IL', 'marital_status'],
  ]
  const statusLines = [
    ['Marital status: single', 'flagged'],
    ['Family status: married', 'flagged'],
    ['Married, 2 children', 'flagged'],
    ['Single, no children', 'flagged'],
    ['Personal: born 1990, married, two children', 'flagged'],
    ['Divorced', 'flagged'],
    ['Married with 3 children', 'flagged'],
    ['Built the scoring step as a single Claude call', 'pass'],
    ['Wrote a single quiz pack for each course', 'pass'],
    ['Skills: Single sign-on, React', 'pass'],
    ['Single-page app with offline sync', 'pass'],
    ["Led a children's education app to 50k users", 'pass'],
    ['Taught 30 children in an after-school coding club', 'pass'],
  ]

  it.each(statusRows.flatMap(([code, key]) => statusLines.map(([line, expected]) => [code, key, line, expected])))(
    'the %s %s check on "%s" is %s',
    async (code, key, line, expected) => {
      const row: { check_def: CheckDef } = await db('norms').where({ country_code: code, key }).first('check_def')
      expect(runCheck(key, row.check_def, personalCv([line])).result).toBe(expected)
    },
  )

  it.each([
    ['US', 'personal_status'],
    ['IL', 'marital_status'],
  ])('the %s %s check also flags children without a marital status', async (code, key) => {
    const row: { check_def: CheckDef } = await db('norms').where({ country_code: code, key }).first('check_def')
    for (const line of ['Children: 2', '2 children', 'Father of two', 'Hobbies: hiking; 3 kids']) {
      expect(runCheck(key, row.check_def, personalCv([line])).result, line).toBe('flagged')
    }
  })

  it('rejects an unknown check type and an invalid pattern', () => {
    expect(checkDefSchema.safeParse({ type: 'min_words', max: 10 }).success).toBe(false)
    expect(checkDefSchema.safeParse({ type: 'absent', pattern: '(' }).success).toBe(false)
  })
})
