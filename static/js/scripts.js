const socket = io();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let peerConnection;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

async function startCall() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);
  peerConnection.addEventListener("icecandidate", event => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  });
  peerConnection.addEventListener("track", event => {
    remoteVideo.srcObject = event.streams[0];
  });

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
}

socket.on("offer", async (data) => {
  if (!peerConnection) await startCall();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", async (data) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
});

socket.on("ice-candidate", async (data) => {
  try {
    await peerConnection.addIceCandidate(data);
  } catch (e) {
    console.error("Error adding received ICE candidate", e);
  }
});

(async function init() {
  await startCall();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
})();
