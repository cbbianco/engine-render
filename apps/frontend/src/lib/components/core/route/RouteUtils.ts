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
    // Nota: El modelo del submódulo no se limpia aquí por diseño para evitar parpadeos
    // en transiciones, permitiendo que el orquestador decida cuándo resetearlo.
  }
}
