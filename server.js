// server.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

const app = express();
app.use(express.json());

// Connect to Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

// Rate limit: 4 orders/day per fingerprint+IP
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 4,
  keyGenerator: (req) => {
    const fp = req.body.fingerprint || 'nofp';
    const ip = req.ip;
    return `${fp}:${ip}`;
  },
  handler: (req, res) => res.status(429).send("❌ Limit reached"),
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
});

app.post('/validate', limiter, (req, res) => {
  if (!req.body.fingerprint) return res.status(400).send("❌ fingerprint required");
  res.status(200).send("✅ Allowed");
});

app.get('/', (req, res) => res.send('✅ Anti-bot backend is working!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`));
