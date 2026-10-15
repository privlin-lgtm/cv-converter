// The shapes /api/convert returns. They mirror server/src/services/result.ts.

export type Direction = 'IL' | 'ABROAD'

export interface CvEntry {
  dates: string
  title: string
  organisation: string
  location: string
  lines: string[]
}

export interface CvSection {
  kind:
    | 'summary'
    | 'experience'
    | 'military_service'
    | 'education'
    | 'skills'
    | 'languages'
    | 'volunteering'
    | 'additional'
    | 'personal_details'
    | 'signature'
  heading: string
  text: string
  entries: CvEntry[]
}

export interface Cv {
  header: { name: string; headline: string; contactLines: string[] }
  sections: CvSection[]
}

// why, sources and status are null when the model cited a key that isn't in the rules.
export interface ResultChange {
  kind: 'removed' | 'added' | 'reworded' | 'reordered' | 'reformatted' | 'flagged'
  what: string
  ruleKey: string
  why: string | null
  sources: string[] | null
  status: 'confirmed' | 'unverified' | null
}

export interface KeyedText {
  text: string
  ruleKey: string
}

export interface CheckResult {
  ruleKey: string
  rule: string
  result: 'pass' | 'flagged'
  detail: string
}

export interface ConversionResult {
  cv: Cv
  changes: ResultChange[]
  questions: KeyedText[]
  notes: KeyedText[]
  checks: CheckResult[]
  meta: { model: string; country: string; paperSize: 'A4' | 'Letter'; documentName: string }
}
