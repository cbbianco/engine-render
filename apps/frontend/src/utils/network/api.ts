import { useAuthStore } from '@/stores/auth/index'

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const authStore = useAuthStore()

    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (authStore.sessionToken) {
        if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${authStore.sessionToken}`)
        }
    }

    let body = options.body

    if (body != null && options.method !== 'GET') {
        try {
            const { encryptPayloadRecursive } = await import('@/utils/security/encryption')

            if (authStore.publicKey) {
                body = JSON.stringify(await encryptPayloadRecursive(JSON.parse(body as string), authStore.publicKey))
            }
        } catch (e) {
            console.error('[apiFetch] Encryption interceptor error:', e)
        }
    }

    const finalOptions: RequestInit = {
        ...options,
        headers,
        body
    }

    const response = await fetch(url, finalOptions)

    if (response.status === 401) {
        authStore.isReauthenticating = true
    }

    return response
}
