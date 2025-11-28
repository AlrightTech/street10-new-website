import axios from "axios";
import { toast } from "react-hot-toast";
import store from "@/redux";
import { resetUser } from "@/redux/authSlice";

// Use local backend in development, deployed backend in production
// In development, use localhost:5000 (backend) unless NEXT_PUBLIC_BASE_URL is explicitly set
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // In development, default to local backend
  if (process.env.NODE_ENV === 'development') {
    return "http://127.0.0.1:8000/api/v1";
  }
  // In production, use deployed backend
  return "https://street10backend.up.railway.app/api/v1";
};

const baseURL = getBaseURL();

// Log base URL in development to verify it's loaded correctly
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Base URL:', baseURL);
}

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error));
  }
);
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            window.location.href = "/login2";
            store.dispatch(resetUser());
            if (typeof localStorage !== 'undefined') {
              localStorage.clear();
            }
            toast.error("Session expired. Please log in again.");
          }
          break;
        case 403:
          toast.error(error.response?.data?.message || "Access forbidden");
          break;
        case 404:
          toast.error(error.response?.data?.message || "Resource not found");
          break;
        case 500:
          toast.error("Internal server error. Please try again later.");
          break;
        default:
          toast.error(error.response?.data?.message || "An error occurred");
          break;
      }
    } else {
      // Network error - could be CORS, backend down, or connection issue
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        // Silently handle network errors - don't log or show toasts
        // The components will handle empty states gracefully
        // Only log in development with console.warn (not console.error) to avoid error overlay
        if (process.env.NODE_ENV === 'development') {
          console.warn("Network Error - Backend may be unavailable:", error.config?.baseURL, error.config?.url);
        }
      } else {
        // Other errors - log as warning in development only
        if (process.env.NODE_ENV === 'development') {
          console.warn("API Error:", error.message || error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
