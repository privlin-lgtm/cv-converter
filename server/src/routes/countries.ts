import { Router } from 'express'
import { getCountries, getNorms } from '../services/norms.js'

export const countriesRouter = Router()

countriesRouter.get('/countries', async (_req, res) => {
  res.json(await getCountries())
})

countriesRouter.get('/countries/:code/norms', async (req, res) => {
  const norms = await getNorms(req.params.code)
  if (!norms) {
    res.status(404).json({ error: 'Unknown country code' })
    return
  }
  res.json(norms.map(({ key, rule, why, sources, status, verifiedOn }) => ({ key, rule, why, sources, status, verifiedOn })))
})
