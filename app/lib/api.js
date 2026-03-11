import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Request interceptor for adding tokens or logging
api.interceptors.request.use(
  (config) => {
    // You can add logic here to include auth tokens if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    console.error("API Error:", message);

    // Handle 401 Unauthorized globally if needed
    if (error.response?.status === 401) {
      // Redirect to login or clear local storage
      // window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  },
);

export default api;
