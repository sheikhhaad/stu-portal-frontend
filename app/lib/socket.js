import { io } from "socket.io-client";

const SOCKET_URL =
  "https://stu-portal-backend.vercel.app";
  // "http://localhost:8000";

let socket;

if (typeof window !== "undefined") {
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("Socket connection error:", err.message);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Socket reconnected after", attemptNumber, "attempts");
  });
} else {
  // SSR placeholder — never used on server, prevents import crash
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {},
    connected: false,
    id: null,
  };
}

export default socket;