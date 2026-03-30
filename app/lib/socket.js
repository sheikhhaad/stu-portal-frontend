import { io } from "socket.io-client";

// backend port jo socket server pe run ho raha hai
const socket = io("https://stu-portal-backend.vercel.app", {
  transports: ["websocket", "polling"], // ensures connection
});

export default socket;