import type { ModuleConfigResponse } from '@/lib/types/module'
import { decodeJwtPayload } from '../security/jwt'

/**
 * Hidrata la configuración de un módulo dinámico con datos provenientes del payload de un token JWT.
 * Solo se aplica si la configuración indica dataSource: 'token'.
 * @param mod Respuesta del catálogo de módulos
 * @param token Token JWT de sesión
 * @returns Módulo decorado con datos en su modelo
 */
export function applyDataSourceToken(
  mod: ModuleConfigResponse,
  token: string | null | undefined
): ModuleConfigResponse {
  const cfg = mod.configurationUi ?? (mod as any).configuration_ui
  if (!cfg || cfg.config?.dataSource !== 'token') return mod
  
  const payload = decodeJwtPayload(token)
  if (!payload) return mod
  
  const baseModel = cfg.model ?? {}
  const newModel: Record<string, unknown> = { ...baseModel }
  
  const schema = cfg.schema ?? []
  schema.forEach((field: any) => {
    const key = field.property
    if (!key) return
    const payloadVal = (payload as Record<string, unknown>)[key]
    if (payloadVal !== undefined && newModel[key] === undefined) {
      newModel[key] = payloadVal
    }
  })
  
  return {
    ...mod,
    configuration_ui: {
      ...cfg,
      model: newModel
    },
    ...(mod.configurationUi ? {
      configurationUi: {
        ...cfg,
        model: newModel,
        bodyModel: newModel
      }
    } : {})
  }
}
