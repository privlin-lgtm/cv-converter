import { describe, expect, it } from 'vitest'
import type { CheckDef } from '../src/schemas/checkDef.js'
import type { Cv } from '../src/schemas/modelOutput.js'
import { renderCvText, runCheck, runChecks } from '../src/services/checks.js'

function cvWith(dates: string[], extraLine = ''): Cv {
  return {
    header: { name: 'Dana Levi', headline: 'Backend Developer', contactLines: ['dana.levi@example.com'] },
    sections: [
      { kind: 'summary', heading: 'Summary', text: 'Backend developer with six years of experience.', entries: [] },
      {
        kind: 'experience',
        heading: 'Experience',
        text: '',
        entries: dates.map((d) => ({
          dates: d,
          title: 'Developer',
          organisation: 'Kestrel Data Ltd.',
          location: 'Tel Aviv',
          lines: ['Built the billing service', extraLine].filter(Boolean),
        })),
      },
    ],
  }
}

describe('renderCvText', () => {
  it('renders the header, headings, prose, entry fields and bullets as lines', () => {
    expect(renderCvText(cvWith(['2019–2023']))).toBe(
      [
        'Dana Levi',
        'Backend Developer',
        'dana.levi@example.com',
        'Summary',
        'Backend developer with six years of experience.',
        'Experience',
        '2019–2023, Developer, Kestrel Data Ltd., Tel Aviv',
        'Built the billing service',
      ].join('\n'),
    )
  })
})

describe('runCheck', () => {
  it('absent passes when the pattern is missing and flags when found', () => {
    const check = { type: 'absent', pattern: '\\b(married|single)\\b', flags: 'i' } as const
    expect(runCheck('marital_status', check, cvWith(['2019–2023']))).toEqual({
      ruleKey: 'marital_status',
      result: 'pass',
      detail: 'Not found',
    })
    expect(runCheck('marital_status', check, cvWith(['2019–2023'], 'Married, two children'))).toEqual({
      ruleKey: 'marital_status',
      result: 'flagged',
      detail: 'Found "Married"',
    })
  })

  it('absent honours a missing flag as case-sensitive', () => {
    const check = { type: 'absent', pattern: 'married' } as const
    expect(runCheck('k', check, cvWith(['2019–2023'], 'Married')).result).toBe('pass')
  })

  it('present passes when the pattern is found and flags when missing', () => {
    const check = { type: 'present', pattern: '\\[Signature\\]' } as const
    expect(runCheck('signature', check, cvWith(['2019–2023'], '[Signature]')).result).toBe('pass')
    expect(runCheck('signature', check, cvWith(['2019–2023']))).toEqual({
      ruleKey: 'signature',
      result: 'flagged',
      detail: 'Expected text not found',
    })
  })

  it('max_words passes at the limit and flags over it', () => {
    const cv = cvWith(['2019–2023'])
    const words = renderCvText(cv).split(/\s+/).length
    expect(runCheck('length_pages', { type: 'max_words', max: words }, cv)).toEqual({
      ruleKey: 'length_pages',
      result: 'pass',
      detail: `${words} words (limit ${words})`,
    })
    expect(runCheck('length_pages', { type: 'max_words', max: words - 1 }, cv).result).toBe('flagged')
  })

  const deDates: CheckDef = { type: 'all_dates_match', pattern: '^\\d{2}/(19|20)\\d{2}$', allow: ['^since \\d{2}/(19|20)\\d{2}$'] }
  const ilDates: CheckDef = { type: 'all_dates_match', pattern: '^((19|20)\\d{2}|\\d{2}/(19|20)\\d{2})$', allow: ['^Present$'] }

  it('all_dates_match passes when every part matches the pattern or an allow entry', () => {
    expect(runCheck('date_format', deDates, cvWith(['03/2019 – 05/2021', 'since 06/2021']))).toEqual({
      ruleKey: 'date_format',
      result: 'pass',
      detail: 'All 2 dates match',
    })
    expect(runCheck('date_format', ilDates, cvWith(['2021-Present', '2018–2021'])).result).toBe('pass')
  })

  it('all_dates_match flags each entry with a part that matches neither', () => {
    expect(runCheck('date_format', deDates, cvWith(['Mar 2019 – May 2021', '06/2021 – 08/2022']))).toEqual({
      ruleKey: 'date_format',
      result: 'flagged',
      detail: 'Dates not in the expected format: "Mar 2019 – May 2021"',
    })
    expect(runCheck('date_format', ilDates, cvWith(['2021–today'])).result).toBe('flagged')
  })

  it('all_dates_match skips entries without dates', () => {
    expect(runCheck('date_format', ilDates, cvWith(['']))).toEqual({
      ruleKey: 'date_format',
      result: 'pass',
      detail: 'No dated entries',
    })
  })
})

describe('runChecks', () => {
  it('runs only the rules that have a check, in order', () => {
    const norms = [
      { key: 'photo', checkDef: null },
      { key: 'date_of_birth', checkDef: { type: 'absent', pattern: 'born', flags: 'i' } as const },
      { key: 'signature', checkDef: { type: 'present', pattern: '\\[Signature\\]' } as const },
    ]
    expect(runChecks(norms, cvWith(['2019–2023'])).map(({ ruleKey, result }) => [ruleKey, result])).toEqual([
      ['date_of_birth', 'pass'],
      ['signature', 'flagged'],
    ])
  })
})
