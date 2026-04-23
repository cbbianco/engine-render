/**
 * Decodifica el payload de un token JWT de forma segura en el cliente.
 * @param token Token JWT completo (header.payload.signature)
 * @returns Objeto con el payload decodificado o null si el token es inválido.
 */
export function decodeJwtPayload(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  
  try {
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch (error) {
    console.error('[JWT Utils] Error decoding payload:', error)
    return null
  }
}
