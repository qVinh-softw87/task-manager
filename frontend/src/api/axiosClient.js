import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// In-memory access token storage (safer than localStorage)
let accessToken = null;

// Function to update the token when it changes (called by AuthContext)
export const setAccessToken = (token) => {
  accessToken = token;
};

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for sending/receiving cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Automatically attach Access Token to the Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Intercept responses and handle token expiration (401)
axiosClient.interceptors.response.use(
  (response) => {
    // Simplify response by directly returning data payload
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid crash if error.response does not exist (e.g., network issue)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call Backend refresh token API (using raw axios)
        const res = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Get new Access Token from response
        const newAccessToken = res.data.data.token;

        // Update new token in memory
        setAccessToken(newAccessToken);

        // Attach new token to the Authorization header of the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails (Refresh Token expired) -> Clear token and dispatch a logout event
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
