import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function createMockAxiosInstance() {
  const requestHandlers: Array<(config: any) => any> = []
  const responseHandlers: Array<{ onFulfilled: (response: any) => any; onRejected: (error: any) => any }> = []

  const instance = vi.fn((config: any) => Promise.resolve({ config, data: {} })) as any
  instance.post = vi.fn()
  instance.get = vi.fn()
  instance.interceptors = {
    request: { use: (fn: any) => requestHandlers.push(fn) },
    response: { use: (onFulfilled: any, onRejected: any) => responseHandlers.push({ onFulfilled, onRejected }) },
  }
  instance.__requestHandlers = requestHandlers
  instance.__responseHandlers = responseHandlers
  return instance
}

let mockInstance: ReturnType<typeof createMockAxiosInstance>

vi.mock('axios', () => ({
  default: {
    create: () => mockInstance,
  },
}))

describe('api', () => {
  let api: typeof import('./api').api
  let setAccessToken: typeof import('./api').setAccessToken
  let getAccessToken: typeof import('./api').getAccessToken

  beforeEach(async () => {
    mockInstance = createMockAxiosInstance()
    vi.resetModules()
    const apiModule = await import('./api')
    api = apiModule.api
    setAccessToken = apiModule.setAccessToken
    getAccessToken = apiModule.getAccessToken
  })

  afterEach(() => {
    setAccessToken(null)
  })

  function runRequestInterceptor(config: any) {
    return (api as any).__requestHandlers[0](config)
  }

  function runResponseErrorInterceptor(error: any) {
    return (api as any).__responseHandlers[0].onRejected(error)
  }

  describe('request interceptor', () => {
    it('attaches the Authorization header when there is an access token', () => {
      setAccessToken('my-token')

      const config = runRequestInterceptor({ headers: {} as Record<string, string> })

      expect(config.headers.Authorization).toBe('Bearer my-token')
    })

    it('does not attach an Authorization header when there is no access token', () => {
      const config = runRequestInterceptor({ headers: {} as Record<string, string> })

      expect(config.headers.Authorization).toBeUndefined()
    })
  })

  describe('response error interceptor', () => {
    it('refreshes the token and retries the original request on a 401', async () => {
      mockInstance.post.mockResolvedValue({ data: { accessToken: 'new-token' } })
      const originalRequest = { url: '/categories', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 401 } }

      await runResponseErrorInterceptor(error)

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/refresh')
      expect(getAccessToken()).toBe('new-token')
      expect(originalRequest.headers.Authorization).toBe('Bearer new-token')
      expect(mockInstance).toHaveBeenCalledWith(originalRequest)
    })

    it('does not attempt to refresh for a 401 on /auth/login', async () => {
      const originalRequest = { url: '/auth/login', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 401 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(error)

      expect(mockInstance.post).not.toHaveBeenCalled()
    })

    it('does not attempt to refresh for a 401 on /auth/register', async () => {
      const originalRequest = { url: '/auth/register', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 401 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(error)

      expect(mockInstance.post).not.toHaveBeenCalled()
    })

    it('treats an absolute URL to a public auth endpoint the same as a relative one', async () => {
      const originalRequest = { url: 'http://localhost:8080/auth/login', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 401 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(error)

      expect(mockInstance.post).not.toHaveBeenCalled()
    })

    it('does not retry a request that has already been retried once', async () => {
      const originalRequest = { url: '/categories', headers: {} as Record<string, string>, _retry: true }
      const error = { config: originalRequest, response: { status: 401 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(error)

      expect(mockInstance.post).not.toHaveBeenCalled()
    })

    it('rejects with the original error for non-401 responses', async () => {
      const originalRequest = { url: '/categories', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 500 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(error)

      expect(mockInstance.post).not.toHaveBeenCalled()
    })

    it('clears the access token and rejects when the refresh call itself fails', async () => {
      setAccessToken('stale-token')
      const refreshError = { response: { status: 401 } }
      mockInstance.post.mockRejectedValue(refreshError)
      const originalRequest = { url: '/categories', headers: {} as Record<string, string> }
      const error = { config: originalRequest, response: { status: 401 } }

      await expect(runResponseErrorInterceptor(error)).rejects.toBe(refreshError)

      expect(getAccessToken()).toBeNull()
    })

    it('queues concurrent 401s behind a single in-flight refresh call', async () => {
      let resolveRefresh: (value: any) => void = () => {}
      mockInstance.post.mockReturnValue(
        new Promise((resolve) => {
          resolveRefresh = resolve
        }),
      )

      const requestA = { url: '/categories', headers: {} as Record<string, string> }
      const requestB = { url: '/tasks', headers: {} as Record<string, string> }
      const errorA = { config: requestA, response: { status: 401 } }
      const errorB = { config: requestB, response: { status: 401 } }

      const resultA = runResponseErrorInterceptor(errorA)
      const resultB = runResponseErrorInterceptor(errorB)

      resolveRefresh({ data: { accessToken: 'shared-token' } })
      await resultA
      await resultB

      expect(mockInstance.post).toHaveBeenCalledTimes(1)
      expect(requestA.headers.Authorization).toBe('Bearer shared-token')
      expect(requestB.headers.Authorization).toBe('Bearer shared-token')
    })
  })
})
