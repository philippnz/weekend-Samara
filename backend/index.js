/**
 * Weekend in Samara — Backend + Telegram Bot (Telegraf)
 */
require('dotenv').config();
const express = require('express');
const knex = require('knex');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

const DB_PATH = process.env.DB_PATH || './data.sqlite';
const db = knex({ client:'sqlite3', connection:{ filename: DB_PATH }, useNullAsDefault:true });

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (_, __, cb)=>cb(null, uploadDir),
  filename: (_, file, cb)=>cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'-'))
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

app.get('/api/routes', async (_,res)=>{
  const rows = await db('routes').select('*');
  for(const r of rows){ r.points = await db('points').where({route_id:r.id}).orderBy('ord'); }
  res.json(rows);
});
app.get('/api/routes/:id', async (req,res)=>{
  const id = req.params.id;
  const r = await db('routes').where({id}).first();
  if(!r) return res.status(404).json({error:'not found'});
  r.points = await db('points').where({route_id:id}).orderBy('ord');
  res.json(r);
});
app.post('/api/admin/routes', upload.single('image'), async (req,res)=>{
  const b = req.body;
  const img = req.file ? ('/uploads/' + req.file.filename) : b.image || null;
  const [id] = await db('routes').insert({ title:b.title, summary:b.summary, price:b.price||0, image:img });
  res.json({id});
});
app.post('/api/admin/point', upload.single('media'), async (req,res)=>{
  const b = req.body;
  const media = req.file ? ('/uploads/' + req.file.filename) : b.media || null;
  const [id] = await db('points').insert({ route_id:b.route_id, ord:b.ord||0, title:b.title, description:b.description, media });
  res.json({id});
});
app.post('/api/orders', async (req,res)=>{
  const b = req.body;
  const [id] = await db('orders').insert({ route_id:b.route_id, name:b.name, contact:b.contact, amount:b.amount||0, status:'pending', created_at:new Date().toISOString() });
  res.json({id});
});
app.get('/api/orders', async (_,res)=>{ res.json(await db('orders').orderBy('created_at','desc')); });
app.get('/api/health', (_,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
app.listen(PORT, ()=>console.log('Server started on', PORT, 'BASE_URL:', BASE_URL));

if (process.env.TELEGRAM_BOT_TOKEN) {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  bot.start((ctx)=>ctx.reply('Привет! Это миниаппа «Уикенд в Самаре». Нажми кнопку:',
    { reply_markup:{ inline_keyboard:[[ {text:'Открыть миниаппу', web_app:{ url: BASE_URL }} ]] } }));
  bot.command('app', (ctx)=>ctx.reply('Открыть миниаппу:', { reply_markup:{ inline_keyboard:[[ {text:'Уикенд в Самаре', web_app:{ url: BASE_URL }} ]] } }));
  bot.launch().then(()=>console.log('Telegram bot launched'));
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
  console.log('TELEGRAM_BOT_TOKEN not set — bot disabled');
}