import type { ModelOutput } from '../schemas/modelOutput.js'
import { runChecks, type CheckResult } from './checks.js'
import type { Country, Norm } from './norms.js'

// why, sources and status are null when the model cited a key that isn't in the rules; the client
// shows those changes as "General edit".
export interface ResultChange {
  kind: ModelOutput['changes'][number]['kind']
  what: string
  ruleKey: string
  why: string | null
  sources: string[] | null
  status: Norm['status'] | null
}

export interface ConversionResult {
  cv: ModelOutput['cv']
  changes: ResultChange[]
  questions: ModelOutput['questions']
  notes: ModelOutput['notes']
  checks: CheckResult[]
  meta: { model: string; country: string; paperSize: Country['paperSize']; documentName: string }
}

export function buildResult(output: ModelOutput, norms: Norm[], country: Country, model: string): ConversionResult {
  const byKey = new Map(norms.map((norm) => [norm.key, norm]))
  return {
    cv: output.cv,
    changes: output.changes.map((change) => {
      const norm = byKey.get(change.ruleKey)
      return {
        ...change,
        why: norm?.why ?? null,
        sources: norm?.sources ?? null,
        status: norm?.status ?? null,
      }
    }),
    questions: output.questions,
    notes: output.notes,
    checks: runChecks(norms, output.cv),
    meta: { model, country: country.code, paperSize: country.paperSize, documentName: country.documentName },
  }
}
