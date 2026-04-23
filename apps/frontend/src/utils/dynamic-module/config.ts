import type { ModuleConfigResponse, ModuleUiConfig } from '@/lib/types/module'

/**
 * Normaliza y extrae el identificador del módulo desde su configuración de UI.
 */
export function normalizeModuleKey(config: ModuleUiConfig | undefined): string | null {
  if (!config) return null
  const fromMetadata = config.metadata?.module
  const direct = config.module
  const raw = (fromMetadata || direct || '').trim()
  if (!raw) return null
  return raw.replace(/^\//, '')
}

/**
 * Busca un módulo en el catálogo basándose en un path de URL.
 */
export function findModuleByPath(
  modules: ModuleConfigResponse[],
  targetPath: string
): ModuleConfigResponse | null {
  const cleanPath = (targetPath || '').replace(/^\/+/, '').split('?')[0] || ''
  const segment = cleanPath.split('/')[0] || ''
  const targetLower = (segment || '').toLowerCase()
  if (!targetLower) return null

  const candidates = modules.filter((mod) => {
    const cfg = mod.configurationUi?.config || (mod as any).configuration_ui?.config

    const keyLower = (normalizeModuleKey(cfg) ?? '').toLowerCase()
    const cfgPathLower = (cfg?.path ?? '').toString().replace(/^\/+/, '').toLowerCase().split('/')[0]
    const moduloFieldLower = (mod.modulo ?? '').toString().replace(/^\/+/, '').toLowerCase()
    const instructionLower = (mod.instruccion ?? '').toString().toLowerCase()

    return (
      keyLower === targetLower ||
      cfgPathLower === targetLower ||
      moduloFieldLower === targetLower ||
      instructionLower === targetLower
    )
  })

  return candidates[0] ?? null
}
