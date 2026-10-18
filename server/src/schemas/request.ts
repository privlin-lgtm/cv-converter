import { z } from 'zod'

export const MAX_CV_CHARS = 20_000

function onlyAllowedPairs<S extends z.ZodType<{ from: string; to: string }>>(schema: S) {
  return schema.refine(({ from, to }) => (from === 'IL' ? to !== 'IL' : to === 'IL'), {
    message: 'Allowed pairs: IL to US, GB or DE; ABROAD to IL',
    path: ['to'],
  })
}

// The text length is checked in the route, not here, because too-long text gets 413, not 400.
export const convertRequestSchema = onlyAllowedPairs(
  z.strictObject({
    from: z.enum(['IL', 'ABROAD']),
    to: z.enum(['US', 'GB', 'DE', 'IL']),
    text: z.string().trim().min(1),
    targetRole: z.string().trim().max(100).optional(),
  }),
)

export type ConvertRequest = z.infer<typeof convertRequestSchema>

export const MAX_COMMENT_CHARS = 500

export const ratingRequestSchema = onlyAllowedPairs(
  z.strictObject({
    from: z.enum(['IL', 'ABROAD']),
    to: z.enum(['US', 'GB', 'DE', 'IL']),
    vsChatbot: z.enum(['better', 'same', 'worse', 'not_tried']),
    score: z.int().min(1).max(5),
    comment: z.string().trim().max(MAX_COMMENT_CHARS).optional(),
  }),
)

export type RatingRequest = z.infer<typeof ratingRequestSchema>
