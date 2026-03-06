import axios from 'axios'
import toast from 'react-hot-toast'

// Create Axios Instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Default fallback usually port 3000
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expiration / Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        toast.error('Session expired. Please log in again.')
      } else {
        // Normal error toast
        const message = error.response.data?.message || 'An error occurred'
        toast.error(message)
      }
    } else if (error.request) {
      toast.error('Network Error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)
