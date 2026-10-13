import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'node:fs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'
import type { ModelOutput } from '../src/schemas/modelOutput.js'
import type { SendMessage } from '../src/services/model.js'
import { CV_END, CV_START } from '../src/services/prompt.js'

afterAll(async () => {
  await db.destroy()
})

const cvText = readFileSync(new URL('./fixtures/il-software-dev.txt', import.meta.url), 'utf8')

const validOutput: ModelOutput = {
  cv: {
    header: { name: 'Noa Ben-Ari', headline: 'Backend Developer', contactLines: ['noa.benari@example.com'] },
    sections: [
      {
        kind: 'experience',
        heading: 'Experience',
        text: '',
        entries: [
          {
            dates: 'Jan 2021 – Present',
            title: 'Senior Backend Developer',
            organisation: 'Kestrel Data Ltd.',
            location: 'Tel Aviv, Israel',
            lines: ['Led the billing service'],
          },
        ],
      },
    ],
  },
  changes: [
    { kind: 'removed', what: 'Removed the date of birth', ruleKey: 'date_of_birth' },
    { kind: 'reworded', what: 'Tightened the bullets', ruleKey: 'not_a_rule' },
  ],
  questions: [{ text: 'Are you authorized to work in the US?', ruleKey: 'work_authorization' }],
  notes: [],
}

function message(text: string, stopReason: Anthropic.StopReason = 'end_turn'): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'fake-model',
    content: [{ type: 'text', text, citations: null }],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 1000, output_tokens: 500 },
  } as unknown as Anthropic.Message
}

type Reply = Anthropic.Message | Error | 'hang'

// Replays the replies in order (the last one repeats) and records each request.
function fakeModel(...replies: Reply[]) {
  const calls: Anthropic.MessageCreateParamsNonStreaming[] = []
  const send: SendMessage = async (params, signal) => {
    calls.push(params)
    const reply = replies[Math.min(calls.length, replies.length) - 1]
    if (reply === 'hang') {
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Anthropic.APIUserAbortError()))
      })
    }
    if (reply instanceof Error) throw reply
    return reply
  }
  return { send, calls }
}

function post(send: SendMessage, body: object, deadlineMs?: number) {
  return request(createApp({ send, model: 'fake-model', deadlineMs })).post('/api/convert').send(body)
}

const ilToUs = { from: 'IL', to: 'US', text: cvText }

let log: MockInstance<typeof console.log>
let error: MockInstance<typeof console.error>
beforeEach(() => {
  log = vi.spyOn(console, 'log').mockImplementation(() => {})
  error = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('POST /api/convert', () => {
  it('returns the result with rules joined, checks run and meta added', async () => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    const res = await post(model.send, { ...ilToUs, targetRole: 'Backend developer' })

    expect(res.status).toBe(200)
    expect(res.body.cv).toEqual(validOutput.cv)
    expect(res.body.changes[0]).toMatchObject({ ruleKey: 'date_of_birth', status: 'confirmed' })
    expect(res.body.changes[0].why).toEqual(expect.any(String))
    expect(res.body.changes[1]).toMatchObject({ ruleKey: 'not_a_rule', why: null, sources: null, status: null })
    expect(res.body.checks).toContainEqual({ ruleKey: 'date_of_birth', result: 'pass', detail: 'Not found' })
    expect(res.body.meta).toEqual({ model: 'fake-model', country: 'US', paperSize: 'Letter', documentName: 'Résumé' })

    expect(model.calls).toHaveLength(1)
    const [params] = model.calls
    expect(params).toMatchObject({ model: 'fake-model', max_tokens: 12000 })
    expect(params.output_config?.format?.type).toBe('json_schema')
    const user = params.messages[0].content as string
    expect(user).toContain('Kind of job: Backend developer')
    expect(user).toContain(`${CV_START}\n${cvText.trim()}\n${CV_END}`)
  })

  it('logs metadata only, never the CV or the result', async () => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    await post(model.send, ilToUs)
    const logged = [...log.mock.calls, ...error.mock.calls].flat().join('\n')
    expect(logged).toContain('"model":"fake-model"')
    expect(logged).toContain('"inputTokens":1000')
    expect(logged).toContain('"outputTokens":500')
    expect(logged).toContain('"from":"IL","to":"US"')
    expect(logged).toContain('"latencyMs":')
    expect(logged).not.toContain('Kestrel')
    expect(logged).not.toContain('Noa')
  })

  it('retries invalid JSON once, then returns 502', async () => {
    const model = fakeModel(message('{"cv": not json'))
    const res = await post(model.send, ilToUs)
    expect(res.status).toBe(502)
    expect(res.body.error).toEqual(expect.any(String))
    expect(model.calls).toHaveLength(2)
  })

  it('retries output that fails the Zod schema, and returns the second, valid answer', async () => {
    const model = fakeModel(message(JSON.stringify({ ...validOutput, notes: 'oops' })), message(JSON.stringify(validOutput)))
    const res = await post(model.send, ilToUs)
    expect(res.status).toBe(200)
    expect(model.calls.map((call) => call.max_tokens)).toEqual([12000, 12000])
  })

  it('retries a max_tokens cut-off with max_tokens 16000', async () => {
    const model = fakeModel(message('{"cv":', 'max_tokens'), message(JSON.stringify(validOutput)))
    const res = await post(model.send, ilToUs)
    expect(res.status).toBe(200)
    expect(model.calls.map((call) => call.max_tokens)).toEqual([12000, 16000])
  })

  it('returns 422 on a refusal, without retrying', async () => {
    const model = fakeModel(message('', 'refusal'))
    const res = await post(model.send, ilToUs)
    expect(res.status).toBe(422)
    expect(model.calls).toHaveLength(1)
  })

  it('returns 504 past the deadline', async () => {
    const model = fakeModel('hang')
    const res = await post(model.send, ilToUs, 50)
    expect(res.status).toBe(504)
  })

  it('applies one deadline across both attempts', async () => {
    const model = fakeModel(message('not json'), 'hang')
    const res = await post(model.send, ilToUs, 50)
    expect(res.status).toBe(504)
    expect(model.calls).toHaveLength(2)
  })

  it('returns 502 when the model call fails', async () => {
    const model = fakeModel(new Error('connection reset'))
    const res = await post(model.send, ilToUs)
    expect(res.status).toBe(502)
    expect(model.calls).toHaveLength(1)
  })

  it.each([
    { from: 'IL', to: 'IL' },
    { from: 'ABROAD', to: 'US' },
    { from: 'ABROAD', to: 'DE' },
    { from: 'FR', to: 'IL' },
  ])('returns 400 for the pair $from → $to', async (pair) => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    const res = await post(model.send, { ...pair, text: cvText })
    expect(res.status).toBe(400)
    expect(model.calls).toHaveLength(0)
  })

  it.each([
    { from: 'IL', to: 'US' },
    { from: 'IL', to: 'US', text: '   ' },
    { from: 'IL', to: 'US', text: cvText, targetRole: 'x'.repeat(101) },
    { from: 'IL', to: 'US', text: cvText, extra: true },
  ])('returns 400 for an invalid body %#', async (body) => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    const res = await post(model.send, body)
    expect(res.status).toBe(400)
    expect(model.calls).toHaveLength(0)
  })

  it('returns 413 for text over 20,000 characters', async () => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    const res = await post(model.send, { ...ilToUs, text: 'a'.repeat(20_001) })
    expect(res.status).toBe(413)
    expect(model.calls).toHaveLength(0)
  })

  it('accepts text of exactly 20,000 characters', async () => {
    const model = fakeModel(message(JSON.stringify(validOutput)))
    const res = await post(model.send, { ...ilToUs, text: 'a'.repeat(20_000) })
    expect(res.status).toBe(200)
  })

  it('returns 400 for malformed JSON without logging the body', async () => {
    const res = await request(createApp({ model: 'fake-model' }))
      .post('/api/convert')
      .set('Content-Type', 'application/json')
      .send('{"text": "Noa Ben-Ari')
    expect(res.status).toBe(400)
    expect([...log.mock.calls, ...error.mock.calls].flat().join('\n')).not.toContain('Noa')
  })
})
