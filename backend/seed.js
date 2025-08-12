const knex = require('knex')({ client:'sqlite3', connection:{ filename: process.env.DB_PATH || './data.sqlite' }, useNullAsDefault:true });
async function run(){
  await knex('orders').del();
  await knex('points').del();
  await knex('routes').del();
  const [rid] = await knex('routes').insert({ title:'Уикенд в Самаре', summary:'2 дня: центр, набережная Волги, Жигулёвские ворота.', price:199 });
  await knex('points').insert([
    { route_id: rid, ord:1, title:'Прогулка по ул. Ленинградской', description:'Исторические дома и атмосфера.', media:'' },
    { route_id: rid, ord:2, title:'Бункер Сталина', description:'Экскурсия в историческое место.', media:'' },
    { route_id: rid, ord:3, title:'Закат на набережной', description:'Лучшее место для фото.', media:'' },
    { route_id: rid, ord:4, title:'Жигулёвские ворота', description:'Природная красота и виды.', media:'' }
  ]);
  console.log('Seed done'); process.exit(0);
}
run().catch(e=>{console.error(e); process.exit(1)});