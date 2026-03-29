const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const VERIFICATION_TOKEN = 'ここに自分のVerification Tokenを貼る';
const ENDPOINT_URL = 'https://xxxx.onrender.com/ebay/notifications'; // 自分のURLに変更

// eBayの疎通確認に応答する
app.get('/ebay/notifications', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).send('No challenge code');

  const hash = crypto.createHash('sha256')
    .update(challengeCode + VERIFICATION_TOKEN + ENDPOINT_URL)
    .digest('hex');

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ challengeResponse: hash });
});

// eBayからの通知を受け取る
app.post('/ebay/notifications', (req, res) => {
  console.log('eBay notification:', req.body);
  res.status(200).send('OK');
});

app.get('/', (req, res) => res.send('OK'));

app.listen(process.env.PORT || 3000);
