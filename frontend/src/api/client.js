import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Send cookies with requests
});

// Remove request interceptor for Authorization header (JWT now in httpOnly cookie)

// Response interceptor (optional - for handling errors globally)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors that are not 401
    if (!(error.response && error.response.status === 401)) {
      if (error.response) {
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        console.error('Network Error:', error.message);
      } else {
        console.error('Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
