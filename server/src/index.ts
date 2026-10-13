import { app } from './app.js'
import { requireEnv } from './env.js'

const port = Number(requireEnv('PORT'))

app.listen(port, (err) => {
  if (err) throw err
  console.log(`API listening on http://localhost:${port}`)
})
