import express from 'express';
const app = express();
app.use(express.json());

const MAX_PER_DAY = 4;
const memoryStore = new Map();

function getTodayKey(fingerprint) {
  const today = new Date().toISOString().slice(0, 10);
  return `${fingerprint}:${today}`;
}

// ✅ Route للواجهة الرئيسية
app.get('/', (req, res) => {
  res.send('✅ Anti-bot backend is working!');
});

// ✅ Endpoint للتحقق من عدد الطلبات
app.post('/validate', (req, res) => {
  const fp = req.body.fingerprint;
  if (!fp) return res.status(400).send("❌ fingerprint required");

  const key = getTodayKey(fp);
  const count = memoryStore.get(key) || 0;

  if (count >= MAX_PER_DAY) {
    return res.status(429).send("❌ Limit reached");
  }

  memoryStore.set(key, count + 1);
  res.status(200).send("✅ Allowed");
});

// ✅ تشغيل السيرفر
app.listen(3000, () => {
  console.log("✅ Anti-bot backend running on port 3000");
});
