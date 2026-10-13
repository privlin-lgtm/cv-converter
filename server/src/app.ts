import express, { type ErrorRequestHandler } from 'express'
import { convertRouter } from './routes/convert.js'
import { countriesRouter } from './routes/countries.js'
import { healthRouter } from './routes/health.js'
import type { ModelOptions } from './services/model.js'

// Answers malformed or oversized JSON bodies here, so Express's default handler never logs them.
const bodyErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'The request body is not valid JSON.' })
  } else if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'The request body is too large.' })
  } else {
    next(err)
  }
}

// Tests pass a fake model; the app uses the real one.
export function createApp(modelOptions: ModelOptions = {}) {
  const app = express()
  app.use(express.json({ limit: '100kb' }))
  app.use('/api', healthRouter)
  app.use('/api', countriesRouter)
  app.use('/api', convertRouter(modelOptions))
  app.use(bodyErrors)
  return app
}

export const app = createApp()
