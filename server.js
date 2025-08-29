import express from 'express';
import redis from 'redis';

const app = express();
app.use(express.json());

const redisClient = redis.createClient();
await redisClient.connect();

app.use(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const blocked = await redisClient.get(`block:${ip}`);
  if (blocked) return res.status(403).json({ error: '🚫 محظور مؤقتاً' });
  next();
});

app.use(async (req, res, next) => {
  const isBot = req.headers['x-bot-status'] === 'true';
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  if (isBot) {
    await redisClient.set(`block:${ip}`, '1', { EX: 86400 });
    return res.status(403).json({ error: '🚫 تم حظرك كبوت مشبوه.' });
  }
  next();
});

app.post('/order', (req, res) => {
  res.json({ success: true, message: '✅ الطلب مقبول' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔒 السيرفر خدام على port ${PORT}`);
});
