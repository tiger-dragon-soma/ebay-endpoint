const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// CORSを許可（ブラウザのArtifactからアクセスできるようにする）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Chatwork-Token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const VERIFICATION_TOKEN = 'tigerdragonsomatigerdragonsomatigerdragonsoma';
const ENDPOINT_URL = 'https://ebay-endpoint-br4w.onrender.com/ebay/notifications';

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

// =====================
// Chatworkプロキシ
// =====================

// メッセージ一覧を取得
app.get('/chatwork/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const token = req.headers['x-chatwork-token'];
  const response = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages?force=1`, {
    headers: { 'X-ChatWorkToken': token }
  });
  const data = await response.json();
  res.json(data);
});

// メッセージを送信
app.post('/chatwork/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const token = req.headers['x-chatwork-token'];
  const { body } = req.body;
  const form = new URLSearchParams();
  form.append('body', body);
  const response = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: { 'X-ChatWorkToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  });
  const data = await response.json();
  res.json(data);
});

// タスクを作成
app.post('/chatwork/rooms/:roomId/tasks', async (req, res) => {
  const { roomId } = req.params;
  const token = req.headers['x-chatwork-token'];
  const { body, assignee_ids, limit } = req.body;
  const form = new URLSearchParams();
  form.append('body', body);
  if (assignee_ids) form.append('to', assignee_ids);
  if (limit) form.append('limit', limit);
  const response = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/tasks`, {
    method: 'POST',
    headers: { 'X-ChatWorkToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  });
  const data = await response.json();
  res.json(data);
});

// ルーム一覧を取得
app.get('/chatwork/rooms', async (req, res) => {
  const token = req.headers['x-chatwork-token'];
  const response = await fetch('https://api.chatwork.com/v2/rooms', {
    headers: { 'X-ChatWorkToken': token }
  });
  const data = await response.json();
  res.json(data);
});

app.get('/', (req, res) => res.send('OK'));
app.listen(process.env.PORT || 3000);
