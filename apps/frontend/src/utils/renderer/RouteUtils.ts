import type { Ref } from 'vue'

/**
 * Clase utilitaria para la gestión de navegación interna y submódulos.
 */
export class RouteUtils {
  /**
   * Regresa a la vista del módulo maestro cerrando el submódulo activo.
   */
  static backToMain(activeSubmodule: Ref<any>): void {
    activeSubmodule.value = null
  }

  /**
   * Genera la lista de breadcrumbs procesada para la navegación actual.
   */
  static getBreadcrumbs(route: any, config: any, activeSubmodule?: any) {
    const base = config?.config?.breadcrumb || []
    const title = config?.config?.metadata?.title || config?.config?.module || 'Tablero'
    const items = [{ ...(base[0] || { label: 'Dashboard', path: '/dashboard' }) }]
    const fLabel = route.query.fromLabel as string
    const fPath = route.query.fromPath as string

    if (fLabel && fPath && fLabel.toLowerCase() !== items[0].label?.toLowerCase()) {
      items.push({ label: fLabel, path: fPath })
    }
    
    if (title.toLowerCase() !== items[0].label?.toLowerCase() && fLabel?.toLowerCase() !== title.toLowerCase()) {
      items.push({ label: title, path: activeSubmodule ? route.path : undefined })
    }

    if (activeSubmodule) {
      const subTitle = activeSubmodule.config?.metadata?.title || activeSubmodule.config?.title || 'Submódulo'
      items.push({ label: subTitle })
    }

    return items
  }

  /**
   * Intenta recuperar datos desde el Query Param (Cifrado Base64).
   */
  static getDataFromQuery(query: any) {
    if (query._rd) {
      try {
        return JSON.parse(decodeURIComponent(atob(query._rd)))
      } catch (e) {
        console.error('[RouteUtils] Error al decodificar datos de la URL:', e)
      }
    }
    return null
  }
}
