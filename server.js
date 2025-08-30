import express from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import RedisStorePkg from 'rate-limit-redis';
const RedisStore = RedisStorePkg.default;

const app = express();
app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
await redisClient.connect();

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
  max: 4,
  keyGenerator: req => {
    const fp = req.body.fingerprint || 'no-fp';
    return `${fp}:${req.ip}`;
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }),
  handler: (_, res) => res.status(429).send("❌ Limit reached")
});

app.get('/', (_, res) => res.send("✅ Anti-bot backend is working!"));

app.post('/validate', limiter, (req, res) => {
  if (!req.body.fingerprint) return res.status(400).send("❌ fingerprint required");
  res.send("✅ Allowed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Anti-bot backend running on port ${PORT}`);
});
