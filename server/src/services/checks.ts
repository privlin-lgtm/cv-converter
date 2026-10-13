import type { CheckDef } from '../schemas/checkDef.js'
import type { Cv } from '../schemas/modelOutput.js'

export interface CheckResult {
  ruleKey: string
  result: 'pass' | 'flagged'
  detail: string
}

// The CV as plain text, one line per field, which is what absent, present and max_words read.
export function renderCvText(cv: Cv): string {
  const lines = [cv.header.name, cv.header.headline, ...cv.header.contactLines]
  for (const section of cv.sections) {
    lines.push(section.heading, section.text)
    for (const entry of section.entries) {
      lines.push([entry.dates, entry.title, entry.organisation, entry.location].filter(Boolean).join(', '))
      lines.push(...entry.lines)
    }
  }
  return lines.filter(Boolean).join('\n')
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function runCheck(ruleKey: string, check: CheckDef, cv: Cv): CheckResult {
  const pass = (detail: string): CheckResult => ({ ruleKey, result: 'pass', detail })
  const flag = (detail: string): CheckResult => ({ ruleKey, result: 'flagged', detail })
  switch (check.type) {
    case 'absent': {
      const match = renderCvText(cv).match(new RegExp(check.pattern, check.flags))
      return match ? flag(`Found "${match[0]}"`) : pass('Not found')
    }
    case 'present': {
      const match = renderCvText(cv).match(new RegExp(check.pattern, check.flags))
      return match ? pass(`Found "${match[0]}"`) : flag('Expected text not found')
    }
    case 'max_words': {
      const words = countWords(renderCvText(cv))
      const detail = `${words} words (limit ${check.max})`
      return words <= check.max ? pass(detail) : flag(detail)
    }
    case 'all_dates_match': {
      const allowed = [check.pattern, ...check.allow].map((pattern) => new RegExp(pattern))
      const dates = cv.sections.flatMap((section) => section.entries.map((entry) => entry.dates.trim())).filter(Boolean)
      const wrong = dates.filter((value) =>
        value.split(/\s*[–-]\s*/).some((part) => !allowed.some((pattern) => pattern.test(part.trim()))),
      )
      if (wrong.length > 0) return flag(`Dates not in the expected format: ${wrong.map((d) => `"${d}"`).join(', ')}`)
      return pass(dates.length > 0 ? `All ${dates.length} dates match` : 'No dated entries')
    }
  }
}

export function runChecks(norms: { key: string; checkDef: CheckDef | null }[], cv: Cv): CheckResult[] {
  return norms.flatMap((norm) => (norm.checkDef ? [runCheck(norm.key, norm.checkDef, cv)] : []))
}
