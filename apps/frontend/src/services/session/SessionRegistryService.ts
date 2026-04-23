const SESSION_REGISTRY_KEY = 'global_session_registry'
const TAB_ID_KEY = 'current_tab_id'
const MAX_UNIQUE_DOMAINS = 3
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const SESSION_TIMEOUT = 60000 // 1 minute (if no heartbeat)

interface TabSession {
  tabId: string
  domain: string
  lastSeen: number
}

/**
 * Servicio centralizado para gestionar el registro de sesiones activas en el navegador.
 * Implementa las reglas de:
 * 1. Un solo dominio por pestaña.
 * 2. Máximo 3 dominios diferentes abiertos simultáneamente.
 */
export class SessionRegistryService {
  private currentTabId: string

  constructor() {
    this.currentTabId = this.getOrCreateTabId()
  }

  /**
   * Obtiene o crea un ID único para la pestaña actual (persiste solo en sessionStorage).
   */
  private getOrCreateTabId(): string {
    let id = sessionStorage.getItem(TAB_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(TAB_ID_KEY, id)
    }
    return id
  }

  /**
   * Carga el registro global desde localStorage.
   */
  private getRegistry(): TabSession[] {
    try {
      const data = localStorage.getItem(SESSION_REGISTRY_KEY)
      const registry = data ? JSON.parse(data) : []
      // Limpiar sesiones "muertas" (que no han reportado heartbeat)
      const now = Date.now()
      return (registry as TabSession[]).filter(s => now - s.lastSeen < SESSION_TIMEOUT)
    } catch {
      return []
    }
  }

  /**
   * Guarda el registro global en localStorage.
   */
  private saveRegistry(registry: TabSession[]): void {
    localStorage.setItem(SESSION_REGISTRY_KEY, JSON.stringify(registry))
  }

  /**
   * Intenta registrar la pestaña actual con un dominio.
   * Devuelve null si tiene éxito, o un mensaje de error si se rompe alguna regla.
   */
  public register(domain: string): { allowed: boolean; message?: string } {
    const registry = this.getRegistry()
    
    // REGLA 1: Dominio Duplicado
    const existingDomainSession = registry.find(s => s.domain === domain && s.tabId !== this.currentTabId)
    if (existingDomainSession) {
      return { 
        allowed: false, 
        message: 'Ya tienes una sesión abierta para este dominio en otra pestaña.' 
      }
    }

    // REGLA 2: Límite Global de 3 Dominios Diferentes
    const uniqueDomains = new Set(registry.map(s => s.domain))
    if (!uniqueDomains.has(domain) && uniqueDomains.size >= MAX_UNIQUE_DOMAINS) {
      return { 
        allowed: false, 
        message: 'Has excedido el número de sesiones (3 dominios diferentes) permitidas por navegador.' 
      }
    }

    // Si pasa todas las reglas, registrar/actualizar esta pestaña
    const updatedRegistry = registry.filter(s => s.tabId !== this.currentTabId)
    updatedRegistry.push({
      tabId: this.currentTabId,
      domain,
      lastSeen: Date.now()
    })
    
    this.saveRegistry(updatedRegistry)
    this.startHeartbeat(domain)

    return { allowed: true }
  }

  /**
   * Elimina la pestaña actual del registro (e.g. al cerrar sesión o cerrar pestaña).
   */
  public unregister(): void {
    const registry = this.getRegistry()
    const updatedRegistry = registry.filter(s => s.tabId !== this.currentTabId)
    this.saveRegistry(updatedRegistry)
  }

  /**
   * Mantiene el registro activo mientras la pestaña esté abierta.
   */
  private startHeartbeat(domain: string): void {
    setInterval(() => {
      const registry = this.getRegistry()
      const mySession = registry.find(s => s.tabId === this.currentTabId)
      if (mySession) {
        mySession.lastSeen = Date.now()
        mySession.domain = domain // Asegurar que el dominio siga siendo el correcto
        this.saveRegistry(registry)
      }
    }, HEARTBEAT_INTERVAL)
  }
}

export const sessionRegistry = new SessionRegistryService()
