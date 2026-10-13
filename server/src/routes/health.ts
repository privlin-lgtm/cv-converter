import { Router } from 'express'
import { db } from '../db.js'

export const healthRouter = Router()

healthRouter.get('/health', async (_req, res) => {
  try {
    await db.raw('select 1')
    res.json({ ok: true, db: true })
  } catch (err) {
    console.error(`health: database unreachable: ${err instanceof Error ? err.message : String(err)}`)
    res.status(503).json({ ok: false, db: false })
  }
})
