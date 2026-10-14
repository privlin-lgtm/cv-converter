import { Router } from 'express'
import { convertRequestSchema, MAX_CV_CHARS } from '../schemas/request.js'
import { convertCv } from '../services/convert.js'
import { ModelError, type ModelOptions } from '../services/model.js'

export function convertRouter(modelOptions: ModelOptions = {}) {
  const router = Router()

  router.post('/convert', async (req, res) => {
    const parsed = convertRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      res.status(400).json({ error: 'Invalid request', issues })
      return
    }
    if (parsed.data.text.length > MAX_CV_CHARS) {
      res.status(413).json({ error: `The CV text is over ${MAX_CV_CHARS.toLocaleString('en')} characters.` })
      return
    }
    try {
      res.json(await convertCv(parsed.data, modelOptions))
    } catch (err) {
      if (!(err instanceof ModelError)) throw err
      res.status(err.status).json({ error: err.message })
    }
  })

  return router
}
