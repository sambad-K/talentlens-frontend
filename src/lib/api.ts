import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL,
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('talentlens_access_token')
      localStorage.removeItem('talentlens_refresh_token')
      localStorage.removeItem('talentlens_user')
      window.location.href = '/login'
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
