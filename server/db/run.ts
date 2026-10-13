import { db } from '../src/db.js'

const command = process.argv[2]

try {
  if (command === 'migrate') {
    const [batch, files]: [number, string[]] = await db.migrate.latest()
    console.log(files.length ? `Batch ${batch}: ran ${files.length} migration(s): ${files.join(', ')}` : 'Already up to date.')
  } else if (command === 'seed') {
    const [files]: [string[]] = await db.seed.run()
    console.log(files.length ? `Ran ${files.length} seed file(s): ${files.join(', ')}` : 'No seed files to run.')
  } else {
    console.error('Usage: tsx db/run.ts migrate|seed')
    process.exitCode = 1
  }
} finally {
  await db.destroy()
}
