const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Route simple
app.get('/', (req, res) => {
  res.send('✅ Server is working!');
});

// ✅ Route to detect bots via user-agent
app.post('/validate', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawl|spider|slurp|curl|wget/i.test(userAgent);

  if (isBot) {
    return res.status(403).send('🛑 Bot detected.');
  }

  res.status(200).send('✅ Human verified.');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
