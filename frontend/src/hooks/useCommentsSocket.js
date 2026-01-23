export function connectCommentsSocket(noteId, onMessage) {
  const token = localStorage.getItem("access");

  const socket = new WebSocket(
    `ws://127.0.0.1:8000/ws/notes/${noteId}/comments/?token=${token}`
  );

  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  return socket;
}
