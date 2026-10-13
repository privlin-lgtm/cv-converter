import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const MARKER = 'FICTIONAL TEST CV — NOT A REAL PERSON'
const fixturesDir = new URL('./fixtures/', import.meta.url)

function fixtureProblems(name: string, text: string): string[] {
  const problems: string[] = []
  const firstLine = text.replace(/^﻿/, '').split(/\r?\n/, 1)[0]
  if (firstLine !== MARKER) problems.push(`${name}: first line must be "${MARKER}"`)
  for (const [email] of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
    if (!email.toLowerCase().endsWith('@example.com')) problems.push(`${name}: email ${email} is not @example.com`)
  }
  return problems
}

describe('test fixtures', () => {
  it('every .txt fixture is marked fictional and uses only @example.com emails', () => {
    const files = readdirSync(fixturesDir).filter((file) => file.endsWith('.txt'))
    const problems = files.flatMap((file) => fixtureProblems(file, readFileSync(new URL(file, fixturesDir), 'utf8')))
    expect(problems).toEqual([])
  })

  it('flags a fixture without the marker line', () => {
    expect(fixtureProblems('a.txt', 'Dana Levi\ndana@example.com')).toEqual([`a.txt: first line must be "${MARKER}"`])
  })

  it('flags an email outside example.com', () => {
    expect(fixtureProblems('b.txt', `${MARKER}\ndana@gmail.com`)).toEqual(['b.txt: email dana@gmail.com is not @example.com'])
  })

  it('accepts a marked fixture with an example.com email', () => {
    expect(fixtureProblems('c.txt', `${MARKER}\nDana Levi\ndana.levi@example.com`)).toEqual([])
  })
})
