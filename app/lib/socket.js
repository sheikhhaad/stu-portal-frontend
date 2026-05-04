import { io } from "socket.io-client";

export const socket = io("https://stu-portal-backend.vercel.app", {
  transports: ["websocket"],
  withCredentials: true
});