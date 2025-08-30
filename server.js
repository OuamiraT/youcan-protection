import express from 'express';
import { Redis } from '@upstash/redis';

const app = express();
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const MAX_PER_DAY = 4;

function getTodayKey(fp) {
  const today = new Date().toISOString().slice(0, 10);
  return `fp:${fp}:${today}`;
}

app.get('/', (_, res) => {
  res.send("✅ Anti-bot backend is working!");
});

app.post('/validate', async (req, res) => {
  const fp = req.body.fingerprint;
  if (!fp) return res.status(400).send("❌ fingerprint required");

  const key = getTodayKey(fp);
  const current = await redis.get(key) || 0;

  if (current >= MAX_PER_DAY) {
    return res.status(429).send("❌ Limit reached for today");
  }

  await redis.set(key, Number(current) + 1, { ex: 86400 }); // expire in 1 day
  res.status(200).send("✅ Allowed");
});

app.listen(3000, () => {
  console.log("✅ Anti-bot backend running on port 3000");
});
