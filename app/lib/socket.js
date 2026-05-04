import { io } from "socket.io-client";

export const socket = io(
  // "https://stu-portal-backend.vercel.app",
  "http://localhost:8000",
  {
    transports: ["websocket"],
    withCredentials: true
  });