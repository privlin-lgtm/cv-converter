import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rate_limits', (t) => {
    t.text('scope').notNullable().checkIn(['convert', 'ratings'])
    t.text('client_hash').notNullable()
    t.timestamp('window_start', { useTz: true }).notNullable()
    t.integer('hits').notNullable()
    t.primary(['scope', 'client_hash', 'window_start'])
    t.index('window_start')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('rate_limits')
}
