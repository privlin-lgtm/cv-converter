import { db } from '../db.js'
import { requireEnv } from '../env.js'
import type { RatingRequest } from '../schemas/request.js'

export async function saveRating({ from, to, vsChatbot, score, comment }: RatingRequest): Promise<number> {
  const [row] = await db('ratings')
    .insert({
      from_code: from,
      to_code: to,
      vs_chatbot: vsChatbot,
      score,
      comment: comment || null,
      model: requireEnv('ANTHROPIC_MODEL'),
    })
    .returning('id')
  return row.id
}
