const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// publicフォルダの静的ファイルを読み込む
app.use(express.static(path.join(__dirname, 'public')));

// トップページ（/）にアクセスした際、確実に index.html を返します
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ★合言葉（変更可能）
const SECRET_PASSWORD = "0929";

let chatHistory = [];

io.on('connection', (socket) => {
  let isAuthenticated = false;

  socket.on('login', (password, callback) => {
    if (password === SECRET_PASSWORD) {
      isAuthenticated = true;
      callback({ success: true, history: chatHistory });
    } else {
      callback({ success: false });
    }
  });

  socket.on('chat message', (msg) => {
    if (!isAuthenticated) return;
    chatHistory.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('clear history', () => {
    if (!isAuthenticated) return;
    chatHistory = [];
    io.emit('history cleared');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
