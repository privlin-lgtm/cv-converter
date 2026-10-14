import { z } from 'zod'

export const MAX_CV_CHARS = 20_000

// The text length is checked in the route, not here, because too-long text gets 413, not 400.
export const convertRequestSchema = z
  .strictObject({
    from: z.enum(['IL', 'ABROAD']),
    to: z.enum(['US', 'GB', 'DE', 'IL']),
    text: z.string().trim().min(1),
    targetRole: z.string().trim().max(100).optional(),
  })
  .refine(({ from, to }) => (from === 'IL' ? to !== 'IL' : to === 'IL'), {
    message: 'Allowed pairs: IL to US, GB or DE; ABROAD to IL',
    path: ['to'],
  })

export type ConvertRequest = z.infer<typeof convertRequestSchema>
