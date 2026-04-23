import { ref, type Ref } from 'vue'

const DEV_DOMAIN_STORAGE_KEY = 'dev_customer_domain'

/**
 * Clase encargada de gestionar el dominio del cliente (tenant).
 * Detecta si estamos en entorno local (incluyendo IPs de red como 192.168.x.x)
 * y permite la reactividad para que los cambios se propaguen.
 */
class CustomerDomainManager {
  private static instance: CustomerDomainManager
  private _domain: Ref<string>

  private constructor() {
    this._domain = ref(this.detectInitialDomain())
  }

  /**
   * Obtiene la instancia única (Singleton) del manager.
   */
  public static getInstance(): CustomerDomainManager {
    if (!CustomerDomainManager.instance) {
      CustomerDomainManager.instance = new CustomerDomainManager()
    }
    return CustomerDomainManager.instance
  }

  /**
   * Obtiene el dominio actual de forma reactiva.
   */
  public get domain(): string {
    return this._domain.value
  }

  /**
   * Detecta si un hostname es local (localhost, 127.0.0.1 o IPs privadas de red).
   */
  private isLocal(hostname: string): boolean {
    const localRegex = /^(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/
    return localRegex.test(hostname)
  }

  /**
   * Lógica de detección inicial siguiendo prioridades.
   */
  private detectInitialDomain(): string {
    if (typeof window === 'undefined') {
      return import.meta.env?.VITE_DEV_DOMAIN ?? 'dominio1.com'
    }

    const hostname = window.location.hostname
    
    // 1. Si NO es local (es un dominio real de producción), usamos el hostname directamente.
    if (!this.isLocal(hostname)) {
      return hostname
    }

    // --- LÓGICA DE DESARROLLO (IPs locales o localhost) ---
    
    // 2. Parámetro de URL ?domain=... (Para pruebas rápidas)
    const urlParams = new URLSearchParams(window.location.search)
    const fromQuery = urlParams.get('domain')
    if (fromQuery && typeof fromQuery === 'string' && fromQuery.trim() !== '') {
      const domain = fromQuery.trim()
      sessionStorage.setItem(DEV_DOMAIN_STORAGE_KEY, domain)
      return domain
    }

    // 3. Segmento de ruta (e.g. localhost:5173/cliente.com/)
    const pathParts = window.location.pathname.split('/')
    const firstPathPart = pathParts[1]
    if (firstPathPart && firstPathPart.includes('.') && firstPathPart.length > 3) {
      sessionStorage.setItem(DEV_DOMAIN_STORAGE_KEY, firstPathPart)
      return firstPathPart
    }

    // 4. Session Storage (Persistencia durante la sesión de la pestaña)
    const fromStorage = sessionStorage.getItem(DEV_DOMAIN_STORAGE_KEY)
    if (fromStorage && fromStorage.trim() !== '') {
      return fromStorage.trim()
    }

    // 5. Variable de entorno VITE_DEV_DOMAIN
    const fromEnv = import.meta.env.VITE_DEV_DOMAIN
    if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim() !== '') {
      return fromEnv.trim()
    }

    // 6. Fallback final
    return 'dominio1.com'
  }

  /**
   * Actualiza el dominio de desarrollo, lo persiste y recarga/actualiza.
   */
  public setDevDomain(domain: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DEV_DOMAIN_STORAGE_KEY, domain)
      this._domain.value = domain
      // Recargamos para que el registro de pestañas y el store se limpien correctamente
      window.location.reload()
    }
  }
}

// Exportamos la instancia única
export const domainManager = CustomerDomainManager.getInstance()

/**
 * Mantenemos getCustomerDomain por compatibilidad, 
 * pero ahora usa internamente el manager.
 */
export function getCustomerDomain(): string {
  return domainManager.domain
}

/**
 * Helper para cambiar el dominio desde la consola o UI.
 */
export function setDevCustomerDomain(domain: string): void {
  domainManager.setDevDomain(domain)
}
