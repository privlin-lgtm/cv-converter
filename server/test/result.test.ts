import { describe, expect, it } from 'vitest'
import type { ModelOutput } from '../src/schemas/modelOutput.js'
import type { Country, Norm } from '../src/services/norms.js'
import { buildResult } from '../src/services/result.js'

const country: Country = { code: 'US', name: 'United States', documentName: 'Résumé', paperSize: 'Letter' }

const norms: Norm[] = [
  {
    key: 'date_of_birth',
    rule: 'Remove the date of birth.',
    why: 'Age is a protected trait.',
    sources: ['https://example.com/dob'],
    status: 'confirmed',
    checkDef: { type: 'absent', pattern: 'date of birth', flags: 'i' },
    verifiedOn: '2026-10-10',
  },
  {
    key: 'summary',
    rule: 'Open with a short summary.',
    why: 'Recruiters skim.',
    sources: [],
    status: 'unverified',
    checkDef: null,
    verifiedOn: '2026-10-10',
  },
]

const output: ModelOutput = {
  cv: {
    header: { name: 'Dana Levi', headline: 'Backend Developer', contactLines: ['dana.levi@example.com'] },
    sections: [{ kind: 'summary', heading: 'Summary', text: 'Backend developer.', entries: [] }],
  },
  changes: [
    { kind: 'removed', what: 'Removed the date of birth', ruleKey: 'date_of_birth' },
    { kind: 'added', what: 'Added a summary', ruleKey: 'summary' },
    { kind: 'reworded', what: 'Tightened the bullets', ruleKey: 'made_up_key' },
    { kind: 'reformatted', what: 'Cleaned up spacing', ruleKey: '' },
  ],
  questions: [{ text: 'Are you authorized to work in the US?', ruleKey: 'work_authorization' }],
  notes: [{ text: 'Assumed a backend developer role.', ruleKey: '' }],
}

describe('buildResult', () => {
  const result = buildResult(output, norms, country, 'fake-model')

  it('joins why, sources and status from the rules by ruleKey', () => {
    expect(result.changes[0]).toEqual({
      kind: 'removed',
      what: 'Removed the date of birth',
      ruleKey: 'date_of_birth',
      why: 'Age is a protected trait.',
      sources: ['https://example.com/dob'],
      status: 'confirmed',
    })
    expect(result.changes[1]).toMatchObject({ ruleKey: 'summary', status: 'unverified', sources: [] })
  })

  it('gives null why, sources and status for an unknown or empty ruleKey', () => {
    for (const change of result.changes.slice(2)) {
      expect(change).toMatchObject({ why: null, sources: null, status: null })
    }
    expect(result.changes[2].ruleKey).toBe('made_up_key')
  })

  it('passes the CV, questions and notes through unchanged', () => {
    expect(result.cv).toEqual(output.cv)
    expect(result.questions).toEqual(output.questions)
    expect(result.notes).toEqual(output.notes)
  })

  it('runs the checks and adds meta from the country', () => {
    expect(result.checks).toEqual([
      { ruleKey: 'date_of_birth', rule: 'Remove the date of birth.', result: 'pass', detail: 'Not found' },
    ])
    expect(result.meta).toEqual({ model: 'fake-model', country: 'US', paperSize: 'Letter', documentName: 'Résumé' })
  })
})
