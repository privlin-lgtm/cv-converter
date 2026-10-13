import { z } from 'zod'

function compiles(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}

const pattern = z.string().min(1).refine(compiles, 'not a valid regular expression')
const flags = z.enum(['', 'i']).optional()

// A rule's deterministic check, stored in norms.check_def and run on the rewritten CV.
// absent, present and max_words read the plain-text CV; all_dates_match reads each entry's dates,
// split on "–" or "-", where each part must match `pattern` or one of the `allow` patterns.
export const checkDefSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('absent'), pattern, flags }),
  z.strictObject({ type: z.literal('present'), pattern, flags }),
  z.strictObject({ type: z.literal('max_words'), max: z.number().int().positive() }),
  z.strictObject({ type: z.literal('all_dates_match'), pattern, allow: z.array(pattern) }),
])

export type CheckDef = z.infer<typeof checkDefSchema>
