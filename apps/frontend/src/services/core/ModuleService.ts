import { HttpClient } from '@/services/core/http/HttpClient'
import { normalizeToArray } from '@/utils/module'
import type { ModuleConfigResponse, ModuleConfigApiResponse } from '@/lib/types/module'

const BASE_URL =
  import.meta.env.VITE_MODULE_API_BASE_URL ?? 'http://localhost:4002'

/**
 * Servicio de módulos: obtiene la configuración UI por nombre de módulo.
 * El endpoint puede devolver un ítem o un arreglo; siempre se normaliza a arreglo (cada posición = módulo a renderizar).
 */
export class ModuleService {
  private readonly http: HttpClient

  constructor(baseUrl: string = BASE_URL) {
    this.http = new HttpClient(baseUrl)
  }

  /**
   * Obtiene el catálogo completo de módulos.
   * GET /api/v1/module -> arreglo de módulos (uno por posición).
   */
  async getAll(
    bearerToken: string
  ): Promise<{ ok: boolean; data?: ModuleConfigResponse[]; path?: any[] }> {
    const path = '/api/v1/module'
    const { status, data } = await this.http.get<ModuleConfigApiResponse>(path, {
      Authorization: `Bearer ${bearerToken}`
    })
    const list = normalizeToArray(data)
    const routes = data?.path ?? []
    const ok = status >= 200 && status < 300 && list.length > 0
    return { ok, data: ok ? list : undefined, path: routes }
  }

  /**
   * Obtiene la configuración UI de uno o varios módulos por nombre (path segment).
   * GET /api/v1/{nombre_modulo}
   * Respuesta: ítem único o arreglo de ítems; se devuelve siempre un arreglo.
   */
  async getByNombre(
    nombreModulo: string,
    bearerToken: string
  ): Promise<{ ok: boolean; data?: ModuleConfigResponse[]; path?: any[] }> {
    const path = `/api/v1/${encodeURIComponent(nombreModulo)}`
    const { status, data } = await this.http.get<ModuleConfigApiResponse>(path, {
      Authorization: `Bearer ${bearerToken}`
    })
    const list = normalizeToArray(data)
    const routes = data?.path ?? []
    const ok = status >= 200 && status < 300 && list.length > 0
    return { ok, data: ok ? list : undefined, path: routes }
  }
}
