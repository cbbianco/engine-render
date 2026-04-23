/**
 * Utilidad de seguridad avanzada (RSA-OAEP).
 * Implementa cifrado asimétrico utilizando la API nativa SubtleCrypto.
 */

/**
 * Convierte un string PEM a un ArrayBuffer (formato DER).
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN (?:PUBLIC|RSA PUBLIC) KEY-----/, '')
    .replace(/-----END (?:PUBLIC|RSA PUBLIC) KEY-----/, '')
    .replace(/\s+/g, '')
  
  const binaryDerString = atob(b64)
  const binaryDer = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i)
  }
  return binaryDer.buffer
}

/**
 * Importa una llave pública RSA en formato PEM.
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
  try {
    const binaryDer = pemToArrayBuffer(pem)
    
    return await crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    )
  } catch (e: any) {
    console.error('[Encryption] Failed to import RSA Public Key. Is the PEM format correct?', e.message)
    throw e
  }
}

/**
 * Cifra un texto usando RSA-OAEP.
 * Retorna el resultado en Base64.
 */
export async function encryptPassword(password: string, publicKeyPem?: string): Promise<string> {
  if (!password) return ''
  
  // VERIFICACIÓN DE CONTEXTO SEGURO (SubtleCrypto requiere HTTPS o Localhost)
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    console.error('[Encryption] ERROR CRÍTICO: Estás en un contexto NO SEGURO (HTTP).')
    console.error('[Encryption] El navegador bloquea el cifrado en dominios que no sean localhost o HTTPS.')
    console.error('[Encryption] RECOMENDACIÓN: Usa http://localhost:5173/?domain=tu-dominio.com para pruebas locales.')
    return '' // No enviamos nada por seguridad si no podemos cifrar
  }

  if (!publicKeyPem || publicKeyPem.trim() === '') {
    console.error('[Encryption] No public key provided. Cannot encrypt password.')
    return ''
  }
  
  try {
    const publicKey = await importPublicKey(publicKeyPem)
    const enc = new TextEncoder()
    const encodedData = enc.encode(password)
    
    console.log('[Encryption] Encrypting password with RSA-OAEP...')
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encodedData
    )
    
    const result = btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    console.log('[Encryption] Encryption successful.')
    return result
  } catch (e: any) {
    console.error('[Encryption] RSA Encrypt Error:', e.message || e)
    return '' // No enviamos el password plano si falla el cifrado en producción
  }
}

/**
 * Procesa un objeto de forma recursiva buscando campos que parezcan contraseñas 
 * y los cifra usando la llave pública proporcionada.
 */
export async function encryptPayloadRecursive(payload: any, publicKeyPem: string): Promise<any> {
  if (!payload || !publicKeyPem) return payload

  // Clonar para evitar mutar el original en el componente
  let copy = Array.isArray(payload) ? [...payload] : { ...payload }
  
  const PASSWORD_KEYS = ['password', 'pass', 'clave', 'contrasena', 'confirmPassword', 'confirmarPassword']
  const PASSWORD_REGEX = new RegExp(`^(${PASSWORD_KEYS.join('|')})$`, 'i')

  for (const key in copy) {
    const value = copy[key]

    if (value && typeof value === 'object') {
      copy[key] = await encryptPayloadRecursive(value, publicKeyPem)
    } else if (typeof key === 'string' && PASSWORD_REGEX.test(key) && typeof value === 'string') {
      copy[key] = await encryptPassword(value, publicKeyPem)
    }
  }

  return copy
}
