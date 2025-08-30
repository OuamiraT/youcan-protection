import express from 'express';
import { Redis } from '@upstash/redis';

const app = express();
app.use(express.json());

// Upstash configuration:
// ضع هنا المتغيرات البيئية في Render
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

const MAX_PER_DAY = 4;

// Create a unique key per fingerprint per day
function getKey(fp) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `orders:${fp}:${today}`;
}

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('✅ Anti-bot backend is working!');
});

// Validate endpoint with Redis rate limiting
app.post('/validate', async (req, res) => {
  const fp = req.body.fingerprint;
  if (!fp) {
    return res.status(400).send('❌ fingerprint required');
  }

  const key = getKey(fp);
  const current = parseInt(await redis.get(key) || '0', 10);

  if (current >= MAX_PER_DAY) {
    return res.status(429).send('❌ Limit reached');
  }

  await redis.set(key, (current + 1).toString(), { ex: 24 * 60 * 60 });
  res.send('✅ Allowed');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
