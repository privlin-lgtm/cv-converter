import express from 'express'
import { countriesRouter } from './routes/countries.js'
import { healthRouter } from './routes/health.js'

export const app = express()

app.use('/api', healthRouter)
app.use('/api', countriesRouter)
