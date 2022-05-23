///////////////////////////  Websockets ///////////////////////////

// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");

// // socket : 서버로의 연결
// const socket = new WebSocket(`ws://${window.location.host}`);

// // socket Connected
// socket.addEventListener("open", () => {
//   console.log("Connected to Server ✅");
// });

// // socket Disconnected
// socket.addEventListener("close", () => {
//   console.log("Disconnected from Server ❌");
// });

// // socket receive a message
// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
// });

// // message(new_message)
// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// // socket send a message(new_message)
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value));
//   input.value = "";
// }

// // socket send a message(nickname)
// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nickForm.querySelector("input");
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);

/////////////////////////// Socket.io ///////////////////////////

// io() => 자동적으로 back-end soket.io와 연결 해주는 function
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 이미 만들어진 방에 참가하는 것과 방을 만드는 것에는 차이가 없음
// - 존재 하지 않는 방에 참가하면 방을 만들고, 한 명만 있는 방이 됨
// - 이미 존재하는 방에 참가하더라도, 단순히 그 방에 들어 가는 형태
// 방에 유무와 상관 없이 그냥 방에 들어가는 형태
// 1. "message" => custom event
// 2. Soket.IO : 자동으로 object => string 으로 변환
// 3. callback : 서버로 부터 호출되는 function => front-end에서 실행
// 4. socket.emit()과 socket.on()의 이벤트 이름은 같아야 사용가능
// 5. 무제한 argument
// 6. 만약 끝날 때 실행되는 function을 보내고 싶으면 socket.emit()의 마지막 argument로 넣어야 함
//     - Front-end에서 실행된 코드는 Back-end가 실행을 시킴
//     - Back-end에서 이 function에 argument을 보낼 수 있음

// style.visibility속성을 사용하여 HTML 요소 숨기기 / 표시
room.hidden = true;

let roomName;

// message 추가
function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 서버에 Nickname 제출
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
  input.value = "";
}

// 서버에 Message 제출
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

// 브라우저 화면 #room로 변경
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const nameForm = room.querySelector("#name");
  const msgForm = room.querySelector("#msg");
  nameForm.addEventListener("submit", handleNicknameSubmit);
  msgForm.addEventListener("submit", handleMessageSubmit);
}

// 서버에 roomName 제출
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived! 😄`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left! 😭`);
});

socket.on("new_message", addMessage);

// 모든 room의 List
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

/////////////////////////  WebRTC  ///////////////////////////

// const myFace = document.getElementById("myFace");
// const muteBtn = document.getElementById("mute");
// const cameraBtn = document.getElementById("camera");
// const camerasSelect = document.getElementById("cameras");
// const call = document.getElementById("call");

// call.hidden = true;

// let myStream;
// let muted = false;
// let cameraOff = false;
// let roomName;
// let myPeerConnection;
// let myDataChannel;

// async function getCameras() {
//   try {
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     const cameras = devices.filter((device) => device.kind === "videoinput");
//     const currentCamera = myStream.getVideoTracks()[0];
//     cameras.forEach((camera) => {
//       const option = document.createElement("option");
//       option.value = camera.deviceId;
//       option.innerText = camera.label;
//       if (currentCamera.label === camera.label) {
//         option.selected = true;
//       }
//       camerasSelect.appendChild(option);
//     });
//   } catch (e) {
//     console.log(e);
//   }
// }

// async function getMedia(deviceId) {
//   const initialConstrains = {
//     audio: true,
//     video: { facingMode: "user" },
//   };
//   const cameraConstraints = {
//     audio: true,
//     video: { deviceId: { exact: deviceId } },
//   };
//   try {
//     myStream = await navigator.mediaDevices.getUserMedia(
//       deviceId ? cameraConstraints : initialConstrains
//     );
//     myFace.srcObject = myStream;
//     if (!deviceId) {
//       await getCameras();
//     }
//   } catch (e) {
//     console.log(e);
//   }
// }

// function handleMuteClick() {
//   myStream
//     .getAudioTracks()
//     .forEach((track) => (track.enabled = !track.enabled));
//   if (!muted) {
//     muteBtn.innerText = "Unmute";
//     muted = true;
//   } else {
//     muteBtn.innerText = "Mute";
//     muted = false;
//   }
// }

// function handleCameraClick() {
//   myStream
//     .getVideoTracks()
//     .forEach((track) => (track.enabled = !track.enabled));
//   if (cameraOff) {
//     cameraBtn.innerText = "Turn Camera Off";
//     cameraOff = false;
//   } else {
//     cameraBtn.innerText = "Turn Camera On";
//     cameraOff = true;
//   }
// }

// async function handleCameraChange() {
//   await getMedia(camerasSelect.value);
//   if (myPeerConnection) {
//     const videoTrack = myStream.getVideoTracks()[0];
//     const videoSender = myPeerConnection
//       .getSenders()
//       .find((sender) => sender.track.kind === "video");
//     videoSender.replaceTrack(videoTrack);
//   }
// }

// muteBtn.addEventListener("click", handleMuteClick);
// cameraBtn.addEventListener("click", handleCameraClick);
// camerasSelect.addEventListener("input", handleCameraChange);

// // Welcome Form (join a room)
// const welcome = document.getElementById("welcome");
// const welcomeForm = welcome.querySelector("form");

// async function initCall() {
//   welcome.hidden = true;
//   call.hidden = false;
//   await getMedia();
//   makeConnection();
// }

// async function handleWelcomeSubmit(event) {
//   event.preventDefault();
//   const input = welcomeForm.querySelector("input");
//   await initCall();
//   socket.emit("join_room", input.value);
//   roomName = input.value;
//   input.value = "";
// }

// welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// // Socket Code
// // emit( 보내다 ), on(받다) , join(들어가다) , leave(나가다)
// socket.on("welcome", async () => {
//   myDataChannel = myPeerConnection.createDataChannel("chat");
//   myDataChannel.addEventListener("message", (event) => console.log(event.data));
//   console.log("made data channel");
//   const offer = await myPeerConnection.createOffer();
//   myPeerConnection.setLocalDescription(offer);
//   console.log("sent the offer");
//   socket.emit("offer", offer, roomName);
// });

// socket.on("offer", async (offer) => {
//   myPeerConnection.addEventListener("datachannel", (event) => {
//     myDataChannel = event.channel;
//     myDataChannel.addEventListener("message", (event) =>
//       console.log(event.data)
//     );
//   });
//   console.log("received the offer");
//   myPeerConnection.setRemoteDescription(offer);
//   const answer = await myPeerConnection.createAnswer();
//   myPeerConnection.setLocalDescription(answer);
//   socket.emit("answer", answer, roomName);
//   console.log("sent the answer");
// });

// socket.on("answer", (answer) => {
//   console.log("received the answer");
//   myPeerConnection.setRemoteDescription(answer);
// });

// socket.on("ice", (ice) => {
//   console.log("received candidate");
//   myPeerConnection.addIceCandidate(ice);
// });

// // RTC Code
// function makeConnection() {
//   myPeerConnection = new RTCPeerConnection({
//     iceServers: [
//       {
//         urls: [
//           "stun:stun.l.google.com:19302",
//           "stun:stun1.l.google.com:19302",
//           "stun:stun2.l.google.com:19302",
//           "stun:stun3.l.google.com:19302",
//           "stun:stun4.l.google.com:19302",
//         ],
//       },
//     ],
//   });
//   myPeerConnection.addEventListener("icecandidate", handleIce);
//   myPeerConnection.addEventListener("addstream", handleAddStream);
//   myStream
//     .getTracks()
//     .forEach((track) => myPeerConnection.addTrack(track, myStream));
// }

// function handleIce(data) {
//   console.log("sent candidate");
//   socket.emit("ice", data.candidate, roomName);
// }

// function handleAddStream(data) {
//   const peerFace = document.getElementById("peerFace");
//   peerFace.srcObject = data.stream;
// }
