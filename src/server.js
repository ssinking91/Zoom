import http from "http";
import WebSocket from "ws";
// import SocketIO from "socket.io";
import express from "express";

const app = express();

// 해당 폴더에서 확장자가 pug인걸 고르겠다는 의미
app.set("views", __dirname + "/views"); // 폴더 경로 지정
app.set("view engine", "pug"); // 확장자 지정

// 정적 파일 제공하기 / 정적 파일: 직접 값에 변화를 주지 않는 이상 변하지 않는 파일을 의미
app.use("/public", express.static(__dirname + "/public"));

// route handler
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

///////////////////////////  Websockets ///////////////////////////

// 서버 설정
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
  console.log("Disconnected from the Browser ❌");
}

// fake database
const sockets = [];

// socket : 연결된 브라우저
wss.on("connection", (socket) => {
  sockets.push(socket);

  socket["nickname"] = "Anon";

  console.log("Connected to Browser ✅");

  socket.on("close", onSocketClose);

  socket.on("message", (msg) => {
    console.log(msg);
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
server.listen(3000, handleListen);

/////////////////////////// Socket.io ///////////////////////////

// // 서버 설정
// const httpServer = http.createServer(app);
// const wsServer = SocketIO(httpServer);

// // emit( 보내다 ), on(받다) , join(들어가다) , leave(나가다)
// wsServer.on("connection", (socket) => {
//   socket.on("join_room", (roomName) => {
//     socket.join(roomName);
//     socket.to(roomName).emit("welcome");
//   });
//   socket.on("offer", (offer, roomName) => {
//     socket.to(roomName).emit("offer", offer);
//   });
//   socket.on("answer", (answer, roomName) => {
//     socket.to(roomName).emit("answer", answer);
//   });
//   socket.on("ice", (ice, roomName) => {
//     socket.to(roomName).emit("ice", ice);
//   });
// });

// const handleListen = () => console.log(`Listening on http://localhost:3000`);
// httpServer.listen(3000, handleListen);
