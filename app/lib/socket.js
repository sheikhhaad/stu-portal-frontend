import { io } from "socket.io-client";

// backend port jo socket server pe run ho raha hai
const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"], // ensures connection
});

export default socket;