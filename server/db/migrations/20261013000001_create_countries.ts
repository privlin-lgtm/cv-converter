import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('countries', (t) => {
    t.text('code').primary()
    t.text('name').notNullable()
    t.text('document_name').notNullable()
    t.text('paper_size').notNullable().checkIn(['A4', 'Letter'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('countries')
}
