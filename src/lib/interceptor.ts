import axios from "axios";
import { toast } from "react-hot-toast";
import store from "@/redux";
import { resetUser } from "@/redux/authSlice";

// Get backend URL from environment variable
// Default to production backend - set NEXT_PUBLIC_BASE_URL in .env.local to override
const getBaseURL = () => {
  // Priority: Use environment variable if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Default: Always use production backend (works everywhere)
  return "https://street10backend.up.railway.app/api/v1";
};

const baseURL = getBaseURL();

// Log base URL in development to verify it's loaded correctly
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Base URL:', baseURL);
}

const apiClient = axios.create({
  baseURL,
  withCredentials: false, // Set to false to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
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
            window.location.href = "/login";
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
        // Don't show toast here - let the component handle it to avoid duplicates
        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn("Network Error - Backend may be unavailable:", error.config?.baseURL, error.config?.url);
        }
      } else {
        // Other errors - show toast only if not handled by component
        // Most components handle their own errors, so we'll be conservative
        if (process.env.NODE_ENV === 'development') {
          console.warn("API Error:", error.message || error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
