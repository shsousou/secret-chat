const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ★合言葉
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

  // 【追加】スマホ側に残っている履歴でサーバーの記憶を復元する機能
  socket.on('restore history', (localHistory) => {
    if (!isAuthenticated) return;
    // サーバーの履歴が空っぽ（再起動直後）の時だけ復元を採用する
    if (chatHistory.length === 0 && localHistory.length > 0) {
      chatHistory = localHistory;
      // 他の接続中の人にも復元された履歴を配る
      io.emit('history restored', chatHistory);
    }
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
