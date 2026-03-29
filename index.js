const express = require('express');
const app = express();
app.use(express.json());

// eBayからの通知を受け取るエンドポイント
app.post('/ebay/notifications', (req, res) => {
  console.log('eBay notification received:', req.body);
  res.status(200).send('OK');
});

// 疎通確認用
app.get('/', (req, res) => res.send('OK'));

app.listen(process.env.PORT || 3000);
