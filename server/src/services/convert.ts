import { requireEnv } from '../env.js'
import type { ConvertRequest } from '../schemas/request.js'
import { convertWithModel, ModelError, type ModelOptions, type ModelUsage } from './model.js'
import { getCountries, getNorms } from './norms.js'
import { buildPrompt } from './prompt.js'
import { buildResult, type ConversionResult } from './result.js'

// Logs metadata only: never the CV, the prompt or the result.
function logConversion(entry: { model: string; from: string; to: string; status: number; usage: ModelUsage; startedAt: number }) {
  const { model, from, to, status, usage, startedAt } = entry
  const latencyMs = Math.round(performance.now() - startedAt)
  console.log(`convert: ${JSON.stringify({ model, from, to, status, ...usage, latencyMs })}`)
}

export async function convertCv(request: ConvertRequest, options: ModelOptions = {}): Promise<ConversionResult> {
  const startedAt = performance.now()
  const model = options.model ?? requireEnv('ANTHROPIC_MODEL')
  const [norms, countries] = await Promise.all([getNorms(request.to), getCountries()])
  const country = countries.find((c) => c.code === request.to)
  if (!norms || !country) throw new Error(`Country ${request.to} is not seeded`)

  const prompt = buildPrompt({ from: request.from, targetRole: request.targetRole, country, norms, text: request.text })
  try {
    const { output, usage } = await convertWithModel(prompt, { ...options, model })
    logConversion({ model, from: request.from, to: request.to, status: 200, usage, startedAt })
    return buildResult(output, norms, country, model)
  } catch (err) {
    if (err instanceof ModelError) {
      logConversion({ model, from: request.from, to: request.to, status: err.status, usage: err.usage, startedAt })
      console.error(`convert: model failure: ${err.reason}`)
    }
    throw err
  }
}
