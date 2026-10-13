import type { Knex } from 'knex'

// Upserted rather than deleted, because norms and ratings reference these rows.
export async function seed(knex: Knex): Promise<void> {
  await knex('countries')
    .insert([
      { code: 'US', name: 'United States', document_name: 'Résumé', paper_size: 'Letter' },
      { code: 'GB', name: 'United Kingdom', document_name: 'CV', paper_size: 'A4' },
      { code: 'DE', name: 'Germany', document_name: 'Curriculum Vitae (Lebenslauf)', paper_size: 'A4' },
      { code: 'IL', name: 'Israel', document_name: 'CV', paper_size: 'A4' },
    ])
    .onConflict('code')
    .merge()
}
