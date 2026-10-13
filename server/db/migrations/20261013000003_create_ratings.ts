import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ratings', (t) => {
    t.increments('id')
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    t.text('from_code').notNullable().checkIn(['IL', 'ABROAD'])
    t.text('to_code').notNullable().references('code').inTable('countries')
    t.text('vs_chatbot').notNullable().checkIn(['better', 'same', 'worse', 'not_tried'])
    t.smallint('score').notNullable().checkBetween([1, 5])
    t.text('comment').nullable().checkLength('<=', 500)
    t.text('model').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('ratings')
}
