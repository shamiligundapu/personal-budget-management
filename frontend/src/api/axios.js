import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL
const baseURL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, '')
  : (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api')

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('budgetAuthToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 405) {
      const customMessage = 'The backend service is not reachable or VITE_API_URL is unconfigured. Please ensure the backend is running and connected.'
      if (error.response.data && typeof error.response.data === 'object') {
        error.response.data.message = customMessage
      } else {
        error.response.data = { message: customMessage }
      }
    }
    return Promise.reject(error)
  }
)

export default api
