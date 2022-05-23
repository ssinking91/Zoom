import http from "http";
// import WebSocket from "ws";
// import SocketIO from "socket.io";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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

// // 서버 설정
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// function onSocketClose() {
//   console.log("Disconnected from the Browser ❌");
// }

// // fake database
// const sockets = [];

// // socket : 연결된 브라우저
// wss.on("connection", (socket) => {
//   sockets.push(socket);

//   socket["nickname"] = "Anon";

//   console.log("Connected to Browser ✅");

//   socket.on("close", onSocketClose);

//   socket.on("message", (msg) => {
//     console.log(msg);
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

// const handleListen = () => console.log(`Listening on http://localhost:3000`);
// server.listen(3000, handleListen);

/////////////////////////// Socket.io ///////////////////////////

// 서버 설정
const httpServer = http.createServer(app);
// const wsServer = SocketIO(httpServer);

const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

// Adapter : 다른 서버들 사이에 실시간 어플리케이션을 동기화
// 모든 soket은 Private room이 있음 / id가 방제목인 경우 => private message를 보낼 수 있음
// room ID 를 soket ID 에서 찾을 수 있다면 => Private용 room
// room ID 를 soket ID 에서 찾을 수 없다면 => Public용 room
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    // Public용 room 이라면
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// emit(보내다), on(받다) , join(들어가다) , leave(나가다), to(특정인, 특정그룹)
// socket : 연결된 브라우저
// "message" => custom event
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));

    // 연결된 모든 socket에 message 보냄 / broadcast : server로 부터 모든 socket으로 보냄
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // disconnecting => 클라이언트가 서버와 연결이 끊어지기 전에 마지막 "굿바이" message를 보낼 수 있는 event
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      // socket으로 부터 room으로 보냄
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    // broadcast : server로 부터 모든 socket으로 보냄
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
