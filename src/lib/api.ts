import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'https://talentlens-backend-gsai.onrender.com'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('talentlens_access_token')

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem('talentlens_refresh_token')

      if (refreshToken) {
        originalRequest._retry = true

        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const newAccessToken = refreshResponse.data.access
          localStorage.setItem('talentlens_access_token', newAccessToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axios(originalRequest)
        } catch {
          localStorage.removeItem('talentlens_access_token')
          localStorage.removeItem('talentlens_refresh_token')
          localStorage.removeItem('talentlens_user')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  },
)

export const extractArrayResponse = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const maybe = payload as Record<string, unknown>
    if (Array.isArray(maybe.results)) return maybe.results
    if (Array.isArray(maybe.data)) return maybe.data
  }

  return []
}
