import Anthropic from '@anthropic-ai/sdk'
import { requireEnv } from '../env.js'
import { modelOutputJsonSchema, modelOutputSchema, type ModelOutput } from '../schemas/modelOutput.js'
import type { Prompt } from './prompt.js'

export const DEADLINE_MS = 150_000
const MAX_TOKENS = 8_000
const MAX_TOKENS_RETRY = 12_000

export type SendMessage = (
  params: Anthropic.MessageCreateParamsNonStreaming,
  signal: AbortSignal,
) => Promise<Anthropic.Message>

// Tests inject `send`, `model` and a short `deadlineMs`; the app uses the defaults.
export interface ModelOptions {
  send?: SendMessage
  model?: string
  deadlineMs?: number
}

export interface ModelUsage {
  inputTokens: number
  outputTokens: number
}

export interface ModelResult {
  output: ModelOutput
  model: string
  usage: ModelUsage
}

// status is the HTTP status the route returns. reason is for the log and never holds CV text.
export class ModelError extends Error {
  constructor(
    readonly status: 422 | 502 | 504,
    message: string,
    readonly reason: string,
    readonly usage: ModelUsage,
  ) {
    super(message)
  }
}

let client: Anthropic | undefined

// Created on first use, so tests and CI never need a key.
const sendWithSdk: SendMessage = (params, signal) => {
  client ??= new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY'), maxRetries: 0, timeout: DEADLINE_MS })
  return client.messages.create(params, { signal })
}

function parseOutput(message: Anthropic.Message): ModelOutput | null {
  const text = message.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('')
  try {
    const parsed = modelOutputSchema.safeParse(JSON.parse(text))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function describe(err: unknown): string {
  if (err instanceof Anthropic.APIError) return `${err.constructor.name} ${err.status ?? ''}`.trim()
  return err instanceof Error ? err.constructor.name : 'unknown error'
}

// One deadline covers every attempt. Retries once if the output fails Zod or is cut off at max_tokens.
export async function convertWithModel(prompt: Prompt, options: ModelOptions = {}): Promise<ModelResult> {
  const send = options.send ?? sendWithSdk
  const model = options.model ?? requireEnv('ANTHROPIC_MODEL')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.deadlineMs ?? DEADLINE_MS)
  const usage: ModelUsage = { inputTokens: 0, outputTokens: 0 }
  let maxTokens = MAX_TOKENS
  let lastProblem = ''
  try {
    for (let attempt = 1; attempt <= 2; attempt++) {
      let message: Anthropic.Message
      try {
        message = await send(
          {
            model,
            max_tokens: maxTokens,
            system: prompt.system,
            messages: [{ role: 'user', content: prompt.user }],
            output_config: { format: { type: 'json_schema', schema: modelOutputJsonSchema } },
          },
          controller.signal,
        )
      } catch (err) {
        if (controller.signal.aborted) {
          throw new ModelError(504, 'The conversion took too long. Please try again.', 'deadline', usage)
        }
        throw new ModelError(502, 'The conversion service failed. Please try again.', describe(err), usage)
      }
      usage.inputTokens += message.usage.input_tokens
      usage.outputTokens += message.usage.output_tokens
      if (message.stop_reason === 'refusal') {
        throw new ModelError(422, 'The model declined to rewrite this CV.', 'refusal', usage)
      }
      if (message.stop_reason === 'max_tokens') {
        maxTokens = MAX_TOKENS_RETRY
        lastProblem = 'max_tokens'
        continue
      }
      const output = parseOutput(message)
      if (output) return { output, model, usage }
      lastProblem = 'invalid output'
    }
    throw new ModelError(502, 'The conversion service returned an invalid result. Please try again.', lastProblem, usage)
  } finally {
    clearTimeout(timer)
  }
}
