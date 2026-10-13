import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('norms', (t) => {
    t.increments('id')
    t.text('country_code').notNullable().references('code').inTable('countries')
    t.text('key').notNullable()
    t.text('rule').notNullable()
    t.text('why').notNullable()
    t.specificType('sources', 'text[]').notNullable().defaultTo('{}')
    t.text('status').notNullable().checkIn(['confirmed', 'unverified'])
    // Not named `check`, which is a reserved word in Postgres.
    t.jsonb('check_def').nullable()
    t.date('verified_on').notNullable()
    t.unique(['country_code', 'key'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('norms')
}
