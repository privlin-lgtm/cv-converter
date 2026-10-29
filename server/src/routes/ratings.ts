import { Router } from 'express'
import { ratingRequestSchema } from '../schemas/request.js'
import { saveRating } from '../services/ratings.js'
import { rateLimit } from './rateLimit.js'

export const ratingsRouter = Router()

ratingsRouter.post('/ratings', rateLimit('ratings'), async (req, res) => {
  const parsed = ratingRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    res.status(400).json({ error: 'Invalid request', issues })
    return
  }
  res.status(201).json({ id: await saveRating(parsed.data) })
})
