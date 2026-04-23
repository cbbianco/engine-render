import type { ModuleConfigResponse } from '@/lib/types/module'

/**
 * Configura el catálogo de módulos en el store.
 * Esta acción es parte de la configuración inicial tras el login o bootstrap.
 */
export function setupModulesConfig(store: any, modules: ModuleConfigResponse[]) {
  store.modulesConfig = modules
}
