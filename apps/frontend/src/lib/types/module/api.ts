import type { SchemaField } from './schema'
import type { ModuleUiConfig } from './config'

/** 
 * Tipos para la respuesta del API de módulos.
 */

export interface ConfigurationUi {
  /** Config avanzada del módulo (metadatos, endpoint, menú, dataSource, ...). */
  config?: ModuleUiConfig
  /** Modelo del formulario; opcional si el endpoint no lo envía (se usa {} por defecto). */
  model?: Record<string, unknown>
  /** Alias oficial para model compatible con los nuevos estándares. */
  bodyModel?: Record<string, unknown>
  schema: SchemaField[]
}

/** Un ítem de módulo (cuando el endpoint devuelve un arreglo). */
export interface ModuleConfigResponse {
  _id?: string
  modulo?: string
  userId?: string
  instruccion?: string
  configuration_ui: ConfigurationUi
  /** Alias oficial para configuration_ui compatible con los nuevos estándares. */
  configurationUi?: ConfigurationUi
  /** Alias oficial para model compatible con los nuevos estándares en el raíz del módulo. */
  bodyModel?: Record<string, unknown>
  orchestrationDetails?: {
    status: string
    consult?: {
      method: string
      uri: string
      endpoint: string
      backend?: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

/** Respuesta de GET /api/v1/module: devuelve un objeto con la lista de módulos y el arreglo de rutas (paths). */
export interface ModuleConfigApiResponse {
  modules: ModuleConfigResponse[]
  path: RoutePathItem[]
}

/** Arreglo de path que recibe el usuario en el DTO (login). */
export interface RoutePathItem {
  path: string
  pathActive?: number
  method?: string
  order?: number
}
