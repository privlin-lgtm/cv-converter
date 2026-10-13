import { z } from 'zod'

export const SECTION_KINDS = [
  'summary',
  'experience',
  'military_service',
  'education',
  'skills',
  'languages',
  'volunteering',
  'additional',
  'personal_details',
  'signature',
] as const

export const CHANGE_KINDS = ['removed', 'added', 'reworded', 'reordered', 'reformatted', 'flagged'] as const

// Limits live here only. The JSON schema below has none, because structured outputs reject them.
const line = z.string().max(1000)
const block = z.string().max(5000)
const list = <T extends z.ZodType>(item: T) => z.array(item).max(60)

const entrySchema = z.strictObject({
  dates: line,
  title: line,
  organisation: line,
  location: line,
  lines: list(line),
})

const sectionSchema = z.strictObject({
  kind: z.enum(SECTION_KINDS),
  heading: line,
  text: block,
  entries: list(entrySchema),
})

export const cvSchema = z.strictObject({
  header: z.strictObject({
    name: line,
    headline: line,
    contactLines: list(line),
  }),
  sections: list(sectionSchema),
})

const keyedText = z.strictObject({ text: block, ruleKey: line })

// What the model returns. ruleKey is "" when no listed rule applies.
export const modelOutputSchema = z.strictObject({
  cv: cvSchema,
  changes: list(z.strictObject({ kind: z.enum(CHANGE_KINDS), what: block, ruleKey: line })),
  questions: list(keyedText),
  notes: list(keyedText),
})

export type Cv = z.infer<typeof cvSchema>
export type ModelOutput = z.infer<typeof modelOutputSchema>

// Written by hand to match modelOutputSchema. Every object sets additionalProperties: false and
// requires every property; there are no length or number constraints.
const string = { type: 'string' } as const
const strings = { type: 'array', items: string } as const

function object(properties: Record<string, unknown>) {
  return { type: 'object', additionalProperties: false, required: Object.keys(properties), properties }
}

const keyedTextJson = object({ text: string, ruleKey: string })

export const modelOutputJsonSchema = object({
  cv: object({
    header: object({ name: string, headline: string, contactLines: strings }),
    sections: {
      type: 'array',
      items: object({
        kind: { type: 'string', enum: [...SECTION_KINDS] },
        heading: string,
        text: string,
        entries: {
          type: 'array',
          items: object({ dates: string, title: string, organisation: string, location: string, lines: strings }),
        },
      }),
    },
  }),
  changes: {
    type: 'array',
    items: object({ kind: { type: 'string', enum: [...CHANGE_KINDS] }, what: string, ruleKey: string }),
  },
  questions: { type: 'array', items: keyedTextJson },
  notes: { type: 'array', items: keyedTextJson },
})
