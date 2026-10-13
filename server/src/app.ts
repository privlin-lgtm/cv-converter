import express from 'express'
import { healthRouter } from './routes/health.js'

export const app = express()

app.use('/api', healthRouter)
