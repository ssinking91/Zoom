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

// // io() => 자동적으로 back-end soket.io와 연결 해주는 function
// const socket = io();

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// // 이미 만들어진 방에 참가하는 것과 방을 만드는 것에는 차이가 없음
// // - 존재 하지 않는 방에 참가하면 방을 만들고, 한 명만 있는 방이 됨
// // - 이미 존재하는 방에 참가하더라도, 단순히 그 방에 들어 가는 형태
// // 방에 유무와 상관 없이 그냥 방에 들어가는 형태
// // 1. "message" => custom event
// // 2. Soket.IO : 자동으로 object => string 으로 변환
// // 3. callback : 서버로 부터 호출되는 function => front-end에서 실행
// // 4. socket.emit()과 socket.on()의 이벤트 이름은 같아야 사용가능
// // 5. 무제한 argument
// // 6. 만약 끝날 때 실행되는 function을 보내고 싶으면 socket.emit()의 마지막 argument로 넣어야 함
// //     - Front-end에서 실행된 코드는 Back-end가 실행을 시킴
// //     - Back-end에서 이 function에 argument을 보낼 수 있음

// // style.visibility속성을 사용하여 HTML 요소 숨기기 / 표시
// room.hidden = true;

// let roomName;

// // message 추가
// function addMessage(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.appendChild(li);
// }

// // 서버에 Nickname 제출
// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#name input");
//   socket.emit("nickname", input.value);
//   input.value = "";
// }

// // 서버에 Message 제출
// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#msg input");
//   const value = input.value;
//   socket.emit("new_message", input.value, roomName, () => {
//     addMessage(`You: ${value}`);
//   });
//   input.value = "";
// }

// // 브라우저 화면 #room로 변경
// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName}`;
//   const nameForm = room.querySelector("#name");
//   const msgForm = room.querySelector("#msg");
//   nameForm.addEventListener("submit", handleNicknameSubmit);
//   msgForm.addEventListener("submit", handleMessageSubmit);
// }

// // 서버에 roomName 제출
// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const input = form.querySelector("input");
//   socket.emit("enter_room", input.value, showRoom);
//   roomName = input.value;
//   input.value = "";
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
//   addMessage(`${user} arrived! 😄`);
// });

// socket.on("bye", (left, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
//   addMessage(`${left} left! 😭`);
// });

// socket.on("new_message", addMessage);

// // 모든 room의 List
// socket.on("room_change", (rooms) => {
//   const roomList = welcome.querySelector("ul");
//   roomList.innerHTML = "";
//
//   if (rooms.length === 0) {
//     return;
//   }

//   rooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;
//     roomList.append(li);
//   });
// });

/////////////////////////  WebRTC  ///////////////////////////

const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

// stream : 비디오와 오디오가 결합된 형태
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
  try {
    // navigator.mediaDevices.enumerateDevices() => 모든 장치와 미디어 장치를 알려줌(컴퓨터에 연결되거나 모바일이 가지고 있는 장치)
    const devices = await navigator.mediaDevices.enumerateDevices();
    // Camera = videoinput
    const cameras = devices.filter((device) => device.kind === "videoinput");

    // myStream.getVideoTracks() => 어떤 카메라가 선택되었는지 알려줌
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // 어떤 카메라가 선택되었는지 표시
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }

      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

// [Peer A,B] getUserMedia() : 사용자의 device에서 오디오와 비디오 데이터 추출할 장치를 준비
async function getMedia(deviceId) {
  // 모바일 장치의 전면 카메라를 요청하기 위한 코드
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    // navigator.mediaDevices.getUserMedia() => 유저미디어(카메라, 오디오)를 string으로 가지고 옴
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );

    //srcObject속성 : HTMLMediaElement연결된 미디어의 소스 역할을 하는 개체를 설정하거나 반환
    myFace.srcObject = myStream;

    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

// stream : 비디오와 오디오가 결합된 형태

// 오디오 on/off
function handleMuteClick() {
  // console.log(myStream.getAudioTracks());
  // myStream.getAudioTracks() => 이 스트림의 오디오 트랙을 나타내는 객체 시퀀스를 반환
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

// 카메라 on/off
function handleCameraClick() {
  // console.log(myStream.getVideoTracks());
  // myStream.getVideoTracks() => 이 스트림의 비디오 트랙을 나타내는 객체 시퀀스를 반환
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

// 카메라 변경
async function handleCameraChange() {
  await getMedia(camerasSelect.value);

  // getSenders() :  - RTCRtpSender 객체의 배열을 반환합니다.
  //                 - 배열의 각 객체는 하나의 트랙의 데이터의 송신을 담당하는 RTP sender를 나타냅니다.
  //                 - Sender => 우리의 peer로 보내진 media stream track(비디오, 오디오)을 컨트롤 해줌
  if (myPeerConnection) {
    // [my Stream] 내가 선택한 새 장치로 업데이트된 video track
    const videoTrack = myStream.getVideoTracks()[0];

    // [peer Stream] 다른 peer 브라우저로 보내지는 video track
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

// input 이벤트는 <input>, <select> 및 <textarea> 요소의 value 속성이 바뀔 때마다 발생
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
// Signaling process

// [Peer A]에서 실행 / 어떤 사람이 우리방에 들어올때 실행
socket.on("welcome", async () => {
  // createDataChannel() => DataChannel: peer-to-peer 유저가 언제든지 모든 종류의 데이터를 주고 받을 수 있는 채널
  // 1. [Peer A] 무언가를 offer하는 soket(peer)이, Data channel을 생성하는 주체가 되어야 함
  // 2. [Peer A] offer을 만들기 전, Data channel을 만들어야 함
  // 3. [Peer B] 다른 peer(offer를 받는)는, Data channel이 있을 때 EventListener를 만들면 됨

  // 변수(myDataChannel)은 양쪽 브라우저에서 모두 정의해야 함
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => console.log(event.data));
  console.log("made data channel");

  // [Peer A] 1. getUserMedia()  => initCall.getMedia()
  // [Peer A] 2. addTrack() => initCall.makeConnection()
  // [Peer A] 3. createOffer()로 offer를 만든후
  const offer = await myPeerConnection.createOffer();

  // [Peer A] 4. setLocalDescription(offer)로 연결을 구성
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");

  // [Peer A] 5. socket.io를 이용하여 데이터 전송
  socket.emit("offer", offer, roomName);
});

// [Peer B]에서 실행
socket.on("offer", async (offer) => {
  // [Peer B] 는, Data channel이 있을 때 EventListener를 만들면 됨
  myPeerConnection.addEventListener("datachannel", (event) => {
    // 변수(myDataChannel)은 양쪽 브라우저에서 모두 정의해야 함
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) =>
      console.log(event.data)
    );
  });

  console.log("received the offer");
  // [Peer B] 1. setRemoteDescription()로 Description을 셋팅
  myPeerConnection.setRemoteDescription(offer);

  // [Peer B] 2. getUserMedia()  => initCall.getMedia()
  // [Peer B] 3. addTrack() => initCall.makeConnection()

  // [Peer B] 4. createAnswer()
  const answer = await myPeerConnection.createAnswer();

  // [Peer B] 5. setLocalDescription()
  myPeerConnection.setLocalDescription(answer);

  // [Peer B] 6. socket.io를 이용하여 데이터 전송
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

// [Peer A] 6. setRemoteDescription(offer)로 Description을 셋팅
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code
function makeConnection() {
  // [Peer A] 1. RTCPeerConnection() : 사용자 간(Peer to Peer) 오디오와 비디오 스트림 전달을 위한 연결 생성
  myPeerConnection = new RTCPeerConnection({
    // STUN 서버 : - 디바이스(노트북, 모바일 등)의 공용 IP주소를 찾아 알려줌
    // iceServers => 구글에서 제공해주는 STUN 서버
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  // icecandidate => 멀리 떨어진 장치와 소통할 수 있게 하기 위함 / 브라우저가 서로 소통할 수 있게 해주는 방법
  myPeerConnection.addEventListener("icecandidate", handleIce);

  // addstream => 개체 RTCPeerConnection형태의 새 미디어가 추가되었을 때 전송
  myPeerConnection.addEventListener("addstream", handleAddStream);

  // [Peer A,B] 양쪽 브라우저에서 카메라와 마이크의 데이터 stream을 받아 RTCPeerConnection() 연결안에 추가
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// icecandidate
function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

// addstream
function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  //srcObject속성 : HTMLMediaElement연결된 미디어의 소스 역할을 하는 개체를 설정하거나 반환
  peerFace.srcObject = data.stream;
}

// WebRTC의 대표적인 기능

// 자바스크립트로 수행하는 WebRTC의 경우, 주요 기능은 다음과 같은  함수에서 수행된다.
// MediaStream : 카메라/마이크 등 데이터 스트림 접근
// getUserMedia() : 사용자의 device에서 오디오와 비디오 데이터 추출할 장치를 준비
// MediaRecorder() : 사용자의 device에서 오디오와 비디오를 녹화
// RTCPeerConnection() : 사용자 간(Peer to Peer) 오디오와 비디오 스트림 전달을 위한 연결 생성
// RTCDataChannel() : 사용자 간 실시간 데이터 전달 수행 / 일반적인 데이터 P2P통신

// WebRTC가 안 좋을 수 있는 몇가지 조건

// 1. 너무 많은 peer를 가질 때
//          => SFU(Selective Forwarding Unit) : - 모든 peer로부터 스트림을 받아 압축함
//                                              - 누가 이방의 호스트인지, 누가 발표하고 있는지, 누가 스크린을 공유하고 있는지 알고있음
//                                              - 서버에 업로드 하면, 서버는 다른 사람들에게 저사양의 스트림을 제공
