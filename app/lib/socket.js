import { io } from "socket.io-client";

// Retrieve URL from environment, or default if missing in development
// const SOCKET_URL =  "http://localhost:8000";
let SOCKET_URL = "https://stu-portal-backend.vercel.app";

const socket = io(SOCKET_URL, {
  autoConnect: false, // Wait for auth before connecting theoretically, but we might just connect and `.emit('join')` later
  reconnectionAttempts: 5,
  timeout: 10000,
  transports: ["websocket", "polling"], // Try websocket first, fallback to polling
});

socket.on("connect_error", (err) => {
  console.log(`Socket connection error: ${err.message}`);
});

export default socket;
