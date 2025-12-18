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
  
  // Default: Always use production backend 
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
// Track if we're currently refreshing token to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept errors on auth endpoints or if already retried
    if (
      originalRequest?.url?.includes('/auth/') ||
      originalRequest?.url?.includes('/api/proxy/auth/') ||
      originalRequest._retry
    ) {
      // Let auth endpoints handle their own errors
      if (error.response) {
        const { status } = error.response;
        switch (status) {
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
            // Don't show toast for auth errors - let the component handle it
            break;
        }
      }
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 - Token expired or invalid
      if (status === 401) {
        // Check if we're on a public page (login, signup, etc.) - don't logout
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/login', '/signup', '/build-vendor-account', '/otp2'];
          
          if (publicPaths.some(path => currentPath.startsWith(path))) {
            // On public page, just reject the error - don't logout
            return Promise.reject(error);
          }
        }

        // If we're already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest && token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // Try to refresh token if we have one
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken && !originalRequest._retry) {
            originalRequest._retry = true;
            isRefreshing = true;

            try {
              // Import authApi dynamically to avoid circular dependency
              const { authApi } = await import('@/services/auth.api');
              const response = await authApi.refreshToken(refreshToken);
              
              if (response.success && response.data.token) {
                // Update tokens
                localStorage.setItem('token', response.data.token);
                if (response.data.refreshToken) {
                  localStorage.setItem('refreshToken', response.data.refreshToken);
                }
                
                // Update user data if provided
                if (response.data.user) {
                  localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                // Update the original request with new token
                if (originalRequest) {
                  originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                }

                // Process queued requests
                processQueue(null, response.data.token);

                // Retry the original request
                return apiClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - logout user
              processQueue(refreshError, null);
              
              // Only logout if we're on a protected page
              const currentPath = window.location.pathname;
              const publicPaths = ['/login', '/signup', '/build-vendor-account'];
              
              if (!publicPaths.some(path => currentPath.startsWith(path))) {
                window.location.href = "/login";
                store.dispatch(resetUser());
                localStorage.clear();
                toast.error("Session expired. Please log in again.");
              }
              
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // No refresh token - logout user (only if not on public page)
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/signup', '/build-vendor-account'];
            
            if (!publicPaths.some(path => currentPath.startsWith(path))) {
              window.location.href = "/login";
              store.dispatch(resetUser());
              localStorage.clear();
              toast.error("Session expired. Please log in again.");
            }
          }
        }

        return Promise.reject(error);
      }

      // Handle other status codes
      switch (status) {
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
