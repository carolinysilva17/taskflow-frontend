import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

type PendingRequestCallback = (token: string | null) => void

let isRefreshing = false
let pendingRequests: PendingRequestCallback[] = []

function subscribeToRefresh(callback: PendingRequestCallback) {
  pendingRequests.push(callback)
}

function resolvePendingRequests(token: string | null) {
  pendingRequests.forEach((callback) => callback(token))
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isRefreshCall = originalRequest?.url === '/auth/refresh'
    const shouldRetry = Boolean(originalRequest) && error.response?.status === 401 && !originalRequest._retry && !isRefreshCall

    if (!shouldRetry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((token) => {
          if (!token) {
            reject(error)
            return
          }
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post('/auth/refresh')
      setAccessToken(data.accessToken)
      resolvePendingRequests(data.accessToken)

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

      return api(originalRequest)

    } catch (refreshError) {

      setAccessToken(null)
      resolvePendingRequests(null)

      return Promise.reject(refreshError)
      
    } finally {
      isRefreshing = false
    }
  },
)
