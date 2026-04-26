import { DynamicParser } from "./DynamicRenderer.utils"
import { ValidationUtils } from "./ValidationUtils"

/**
 * Clase utilitaria para la lógica específica de orquestación de módulos y navegación.
 */
export class ModuleUtils {
  /**
   * Genera la lista de breadcrumbs procesada para la navegación actual.
   */
  static getProcessedBreadcrumbs(config: any, route: any, activeSubmodule?: any) {
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
   * Actualiza el modelo del submódulo y sincroniza con el modelo maestro si la propiedad existe.
   */
  static updateSubmoduleModel(
    prop: string, 
    val: any, 
    submoduleModel: any, 
    mainModel: any, 
    activeSubmodule: any, 
    validationErrors: any
  ): void {
    submoduleModel[prop] = val
    // Sincronización: Si el campo también existe en el modelo maestro, lo actualizamos
    if (mainModel[prop] !== undefined) {
      mainModel[prop] = val
    }

    // EXCLUSIÓN MUTUA: Logo URL vs Logo File
    if (prop === 'logoUrl' && val) {
      submoduleModel.logoFile = null
    } else if (prop === 'logoFile' && val) {
      submoduleModel.logoUrl = ''
    }

    // Validaciones locales
    const items = activeSubmodule?.schema || activeSubmodule?.module || []
    const item = items.find((f: any) => DynamicParser.getProp(f) === prop)
    if (item) {
      ValidationUtils.runValidation(validationErrors, submoduleModel, prop, val, item)
    }
  }
}
