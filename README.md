# ✨ Zoom

<br />

Zoom Clone using NodeJS, WebRTC and Websockets.

<br />

# 🔧 실행방법

```jsx
cd Zoom

npm i

npm run dev
```

<br />

# 🛠 주요 라이브러리

<br/>

- nodemon

  - 파일을 관찰하고 있다가 변경점이 발생하면 자동으로 애플리케이션을 재시작해주는 편리한 도구

<br/>

- @babel/core

  - 바벨의 핵심 파일, 바벨의 다른 모듈들이 종속성을 가짐

<br/>

- @babel/node

  - 바벨의 CLI 도구 중 하나이다. 이전 버전의 babel-cli 로부터 분리됨

<br/>

- @babel/preset-env

  - 바벨의 preset 중 하나로 es6+ 이상의 자바스크립트를 각 브라우저/ 노드 환경에 맞는 코드로 변환시켜줌

  - 전체 설정 파일인 babel.config.js / babel.config.json 파일을 만들어 설정하는 방법

  - 지역 설정 파일인 .babelrc 파일과 package.json 에 babel key를 넣어서 설정하는 방법

  - 여기서 전체 설정과 지역 설정이 겹치는 설정이 존재할 경우 지역 설정으로 덮어진다. (쉽게 전역 변수를 지역변수로 덮는다 생각하면 된다.)

## <br />

- socket.io

  - Socket.io란 Websocket을 기반으로 실시간 웹 애플리케이션을 위한 JavaScript 라이브러리

  - 웹 클라이언트와 서버 간의 실시간 양방향 통신을 가능하게 해주는 Node.js의 모듈

  - Socket.io에서는 여러가지 메소드들을 제공을 해주는데 emit( 보내다 ), on(받다) , join(들어가다) , leave(나가다) room(방을 만들어 room에 들어있는 소켓끼리 통신할수 있게 해준다) 등등 을 제공

<br />

- ⭐ socket.io

```javascript
var socket = io.connect("서버 주소");
socket.on("서버에서 받을 이벤트명", function (데이터) {
  // 받은 데이터 처리
  socket.emit("서버로 보낼 이벤트명", 데이터);
});

io("주소", { 설정명: "설정값" }); // 클라이언트 설정

SocketIo(server, { 설정명: "설정값" }); // 서버 설정
```

<br />

---

<br />

- 💡 전체 : 클라이언트에서 socket.on('이벤트명', 콜백)를 등록해 해당 이벤트가 오기를 기다리는 페이지 전부를 의미

```javascript
io.emit("이벤트명", 데이터);

io.sockets.emit("이벤트명", 데이터);
```

<br />

---

<br />

- 💡 네임스페이스 : 전체에게 메시지를 보내는 것은 사실 / 네임스페이스에게 메시지를 보내는 것임. 네임스페이스를 바꾸려면 서버에서는 of 메서드를 사용

```javascript
const chat = io.of('/chat');
chat.on('connection', (socket) => {
  ...
});
```

클라이언트에서는 연결 시 주소를 바꿔줘야함. 주소 뒤에 네임스페이스를 붙여줌

```javascript
io.connect("주소/chat", 설정);
```

이렇게 하는 이유는 필요한 사람들에게만 메시지를 보내기 위함

<br />

---

<br />

- 💡 나를 제외한 전체

나를 제외한 전체에게 메세지를 보내는 방법임. io를 사용하지 않고 socket 안에 있는 broadcast 객체를 사용

```javascript
socket.broadcast.emit("이벤트명", 데이터);
```

<br />

---

<br />

- 💡 특정인

특정 한 사람에게 메세지를 보낼 수 있음. 귓속말같은 것이나 1대1 채팅을 구현할 때 사용

```javascript
io.to(소켓아이디).emit('이벤트명' 데이터);
```

자신의 소켓아이디는 socket.id를 통해 얻을 수 있습니다. 다른 사람에게 메세지를 보내려면 그 사람의 소켓 아이디가 필요한데 이 때는 데이터에 자신의 소켓 아이디를 넣어 전달해줘서 다른 사람들이 자신에게 메시지를 보낼 수 있도록 허용하면 됩니다.

<br />

---

<br />

- 💡 특정 그룹

특정 그룹에게도 메세지를 보낼 수 있음. 대신 사람들을 그 그룹에 먼저 들어야가 함. 네임스페이스보다는 작은 개념임. 네임스페이스 안에 그룹을 만드는 셈

```javascript
socket.join(방의 아이디); // 그룹에 들어가기
socket.leave(방의 아이디); // 그룹 떠나기
```

방의 아이디는 단순히 문자열일 뿐이라서 아무 거나 생성해주면 됩니다. 예를 들면 방의 아이디가 'room01'일 경우 두 명 이상이 'room01'에 join하면 그룹 채팅을 할 수 있습니다. 메세지는 그룹 전체에게 보내는 방식과 나를 제외한 그룹 전체에게 보내는 두 가지 방식이 있습니다.

```javascript
io.to(방의 아이디).emit('이벤트명', 데이터); // 그룹 전체
socket.broadcast.to(방의 아이디).emit('이벤트명', 데이터); // 나를 제외한 그룹 전체
```

<br />

---

<br />

- 💡 그룹의 목록과 그룹 안의 소켓들을 확인하는 방법

```javascript
io.adapter.rooms;
io.of(네임스페이스).adapter.rooms;
socket.adapter.rooms;
```

한가지 팁을 드리자면, 위의 방법대로 참여 인원 수나 방의 수를 구하는 것이 불안정하기 때문에 서버 상에서 배열을 만들어 방의 아이디를 모아두는 것이 편할 것 같습니다. 그리고 방 안에는 참여한 사람들의 소켓 아이디를 넣어두고요.

```javascript
[
{ \_id: 'room01', members: ['zero_id', 'aero_id']},
{ \_id: 'room02', members: ['nero_id', 'hero_id']},
]
```

이런 식으로요. 서버가 꺼지지 않는 이상 저 배열은 데이터베이스처럼 동작할 겁니다. 이 방식은 서버의 메모리에 저장하는 것이기 때문에 날아갈 위험이 있습니다. 나중에는 저 부분을 데이터베이스와 연결하여 방의 목록과 멤버를 영구적으로 저장하면 됩니다.

[Socket.io 더 알아보기](https://www.zerocho.com/category/NodeJS/post/57edfcf481d46f0015d3f0cd)

<br/>

- @socket.io/admin-ui

  - Socket.IO 관리 UI를 사용하여 Socket.IO 배포 상태에 대한 개요를 볼 수 있음

<br/>

- express

  - 웹 및 모바일 애플리케이션을 위한 일련의 강력한 기능을 제공하는 간결하고 유연한 Node.js 웹 애플리케이션 프레임워크

<br/>

- localtunnel

  - 로컬 서버에 대한 보안 액세스 생성, 어디서든 원하는 사람에게 액세스 할 수 있음

<br />

- pug

  - 템플릿 엔진

  - 자바스크립트를 사용하여 HTML을 렌더링할 수 있게 해줌

<br/>

- ws

  - 웹 소켓은 실시간 양방향 데이터 전송을 위한 기술로서, ws 프로토콜 사용하여 통신

  - 최신 브라우저는 대부분 웹 소켓을 지원하며, 노드는 ws나 Socket.IO같은 패키지를 통해 웹 소켓 사용 가능

<br/>
