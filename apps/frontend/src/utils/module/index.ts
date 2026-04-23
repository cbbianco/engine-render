import type { ModuleConfigResponse, ModuleConfigApiResponse } from '@/lib/types/module'

/**
 * Normaliza la respuesta de la API de módulos a un arreglo determinista de configuraciones.
 * Filtra los módulos que no poseen una configuración de interfaz de usuario definida.
 * 
 * @param response Respuesta opcional de la API
 * @returns Arreglo de configuraciones de módulos válidas
 */
export function normalizeToArray(response: ModuleConfigApiResponse | null | undefined): ModuleConfigResponse[] {
  if (response == null) return []
  if (response.modules && Array.isArray(response.modules)) {
    return response.modules.filter((item) => item?.configurationUi != null)
  }
  return []
}
