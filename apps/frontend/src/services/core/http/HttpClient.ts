/**
 * Cliente HTTP genérico para llamadas a APIs.
 * Todas las llamadas HTTP de la app deben usar esta clase (o servicios que la usen).
 */
export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown
      headers?: Record<string, string>
    }
  ): Promise<{ status: number; data?: T }> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers
    }
    const init: RequestInit = {
      method,
      headers
    }

    if (options?.body != null && method !== 'GET') {
      let finalBody = options.body
      
      // Interceptor de Cifrado Global
      try {
        const { encryptPayloadRecursive } = await import('@/utils/security/encryption')
        const { useAuthStore } = await import('@/stores/auth/index')
        const authStore = useAuthStore()
        
        if (authStore.publicKey && authStore.publicKey.trim() !== '') {
          finalBody = await encryptPayloadRecursive(options.body, authStore.publicKey)
        }
      } catch (e) {
        console.error('[HttpClient] Encryption interceptor error:', e)
      }

      init.body = JSON.stringify(finalBody)
    }
    const response = await fetch(url, init)
    const status = response.status

    if (status === 401) {
      try {
        const { useAuthStore } = await import('@/stores/auth/index')
        const authStore = useAuthStore()
        
        // REGLA: Solo activamos re-autenticación si el token que falló es el actual.
        // Si ya tenemos un token diferente (nuevo), ignoramos este 401 antiguo.
        const currentToken = authStore.sessionToken
        const requestToken = options?.headers?.Authorization?.replace('Bearer ', '')
        
        if (!requestToken || requestToken === currentToken) {
          authStore.isReauthenticating = true
        }
      } catch (e) {
        console.error('[HttpClient] Error triggering reauth:', e)
      }
    }

    let data: T | undefined
    const hasBody = response.body != null
    if (hasBody) {
      try {
        const text = await response.text()
        if (text?.trim()) {
          data = JSON.parse(text) as T
        }
      } catch {
        // ignore
      }
    }
    return { status, data }
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<{ status: number; data?: T }> {
    return this.request<T>('GET', path, { headers })
  }

  async post<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<{ status: number; data?: T }> {
    return this.request<T>('POST', path, { body, headers })
  }

  async put<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<{ status: number; data?: T }> {
    return this.request<T>('PUT', path, { body, headers })
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<{ status: number; data?: T }> {
    return this.request<T>('DELETE', path, { headers })
  }

  async patch<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<{ status: number; data?: T }> {
    return this.request<T>('PATCH', path, { body, headers })
  }
}
