import { db } from '../db.js'
import type { CheckDef } from '../schemas/checkDef.js'

export interface Country {
  code: string
  name: string
  documentName: string
  paperSize: 'A4' | 'Letter'
}

export interface Norm {
  key: string
  rule: string
  why: string
  sources: string[]
  status: 'confirmed' | 'unverified'
  checkDef: CheckDef | null
  verifiedOn: string
}

export async function getCountries(): Promise<Country[]> {
  return db('countries')
    .select('code', 'name', 'document_name as documentName', 'paper_size as paperSize')
    .orderBy('name')
}

// Returns null for an unknown country code.
export async function getNorms(code: string): Promise<Norm[] | null> {
  const country = await db('countries').where({ code }).first('code')
  if (!country) return null
  return db('norms')
    .where({ country_code: code })
    .select(
      'key',
      'rule',
      'why',
      'sources',
      'status',
      'check_def as checkDef',
      // A plain string, so the date can't shift with the server's time zone.
      db.raw(`to_char(verified_on, 'YYYY-MM-DD') as "verifiedOn"`),
    )
    .orderBy('id')
}
