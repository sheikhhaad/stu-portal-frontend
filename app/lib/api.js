import axios from "axios";

const API_URL =
  "https://stu-portal-backend.vercel.app";
  // "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export default api;
