const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// publicフォルダの中身をブラウザに表示する
app.use(express.static('public'));

// ★ここをお好きなパスワードに変更してください
const SECRET_PASSWORD = "0929"; 
let chatHistory = []; // メモリ上にのみ保存（手動削除で消えます）

io.on('connection', (socket) => {
  let isAuthenticated = false;

  // ログイン処理
  socket.on('login', (password, callback) => {
    if (password === SECRET_PASSWORD) {
      isAuthenticated = true;
      callback({ success: true, history: chatHistory });
    } else {
      callback({ success: false });
    }
  });

  // メッセージ受信
  socket.on('chat message', (msg) => {
    if (!isAuthenticated) return;
    chatHistory.push(msg);
    io.emit('chat message', msg); // 全員に送信
  });

  // 手動全削除
  socket.on('clear history', () => {
    if (!isAuthenticated) return;
    chatHistory = []; // サーバー上の履歴を空にする
    io.emit('history cleared'); // 全クライアントに削除を通知
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
