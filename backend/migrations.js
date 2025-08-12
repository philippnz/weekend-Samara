const knex = require('knex')({ client:'sqlite3', connection:{ filename: process.env.DB_PATH || './data.sqlite' }, useNullAsDefault:true });
async function run(){
  if(!await knex.schema.hasTable('routes')){
    await knex.schema.createTable('routes', t=>{
      t.increments('id').primary();
      t.string('title'); t.text('summary'); t.integer('price'); t.string('image');
    });
  }
  if(!await knex.schema.hasTable('points')){
    await knex.schema.createTable('points', t=>{
      t.increments('id').primary();
      t.integer('route_id'); t.integer('ord'); t.string('title'); t.text('description'); t.string('media');
    });
  }
  if(!await knex.schema.hasTable('orders')){
    await knex.schema.createTable('orders', t=>{
      t.increments('id').primary();
      t.integer('route_id'); t.string('name'); t.string('contact'); t.integer('amount'); t.string('status'); t.string('created_at');
    });
  }
  console.log('Migrations done'); process.exit(0);
}
run().catch(e=>{console.error(e); process.exit(1)});