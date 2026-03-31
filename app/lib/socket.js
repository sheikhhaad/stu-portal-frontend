import { io } from "socket.io-client";

const socket = io("https://stu-portal-backend.vercel.app", {
  autoConnect: false,
});

if (typeof window !== "undefined") {
  socket.connect();
}

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("connect_error", (err) => console.log("Socket error:", err.message));

export default socket;
