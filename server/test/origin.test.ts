import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { detectOrigin, findDirectionMismatch } from '../src/shared/origin.js'

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

describe('detectOrigin', () => {
  it.each([
    { file: 'il-software-dev.txt', origin: 'IL' },
    { file: 'il-ops-combat-reserves.txt', origin: 'IL' },
    { file: 'uk-olah.txt', origin: 'ABROAD' },
    { file: 'us-resume.txt', origin: 'ABROAD' },
    { file: 'de-lebenslauf.txt', origin: 'ABROAD' },
  ])('detects $file as $origin', ({ file, origin }) => {
    expect(detectOrigin(fixture(file)).origin).toBe(origin)
  })

  it('names the Israeli signals it matched', () => {
    expect(detectOrigin(fixture('il-software-dev.txt')).signals).toEqual([
      'Hebrew text',
      'IDF service',
      'Israeli ID number',
      'Israeli university',
      '+972 or 05x phone number',
      'Israeli city',
    ])
  })

  it('weighs aliyah and UK qualifications above an Israeli phone and address', () => {
    expect(detectOrigin(fixture('uk-olah.txt'))).toEqual({
      origin: 'ABROAD',
      signals: ['aliyah or ulpan', 'UK qualifications'],
    })
  })

  it('is unsure when nothing points either way', () => {
    expect(detectOrigin('FICTIONAL TEST CV — NOT A REAL PERSON\nDana Example\nBackend developer')).toEqual({
      origin: 'unsure',
      signals: [],
    })
  })

  it('is unsure when one weak signal is all there is', () => {
    expect(detectOrigin('Dana Example\nPhone: +972 54 555 0100').origin).toBe('unsure')
  })

  it('is unsure when the signals cancel out', () => {
    expect(detectOrigin('Dana Example\nIDF service 2015-2018\nBA (Hons), University of Leeds').origin).toBe('unsure')
  })
})

describe('findDirectionMismatch', () => {
  it('reports a confident detection that contradicts the chosen direction', () => {
    expect(findDirectionMismatch('ABROAD', fixture('il-ops-combat-reserves.txt'))).toEqual({
      detected: 'IL',
      signals: ['Hebrew text', 'IDF service', 'Israeli university', '+972 or 05x phone number', 'Israeli city'],
    })
  })

  it('is null when the direction matches', () => {
    expect(findDirectionMismatch('ABROAD', fixture('de-lebenslauf.txt'))).toBeNull()
  })

  it('is null when the detector is unsure', () => {
    expect(findDirectionMismatch('IL', 'Dana Example\nBackend developer')).toBeNull()
  })
})
