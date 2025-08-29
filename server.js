const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// 👉 cache مؤقتة فـ RAM
const ipRequests = {};

// ⏱️ الوقت اللي غادي نفرّغو فيه العداد (كل 24 ساعة)
setInterval(() => {
  for (let ip in ipRequests) {
    delete ipRequests[ip];
  }
  console.log("🔁 تم إعادة تعيين الطلبات اليومية.");
}, 24 * 60 * 60 * 1000); // كل 24 ساعة

// 🧠 check bots + IP rate limit
app.post('/validate', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // 🔍 تحقق واش بوت
  const isBot = /bot|crawl|spider|slurp|curl|wget/i.test(userAgent);

  // ⏳ راقب عدد الطلبات لكل IP
  if (!ipRequests[ip]) {
    ipRequests[ip] = 1;
  } else {
    ipRequests[ip]++;
  }

  // ❌ إذا دار أكثر من 3 محاولات
  if (ipRequests[ip] > 3) {
    return res.status(429).send("🚫 تجاوزت الحد المسموح (3 محاولات فاليوم).");
  }

  // ❌ إذا هو بوت
  if (isBot) {
    return res.status(403).send("🤖 Bot detected!");
  }

  // ✅ كلشي مزيان
  res.status(200).send("✅ Human OK");
});

// 🔁 test route
app.get('/', (req, res) => {
  res.send("✅ Server is working!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
