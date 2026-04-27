import { apiFetch } from '@/utils/network/api'
import { DynamicParser } from '@/utils/renderer/DynamicRenderer.utils'

export type ActionExecutionResult = 
  | { success: true; data?: any }
  | { success: false; message: string }

/**
 * Servicio encargado de la orquestación de red y acciones para el DynamicRenderer.
 */
export class RendererService {
  /**
   * Consume datos remotos definidos en una orquestación (consult).
   */
  async fetchConsultData(consult: any, model: Record<string, any>, params?: { page?: number; limit?: number }): Promise<any> {
    if (!consult) return null
    
    try {
      let url = DynamicParser.resolveEndpointUri(consult, model)

      // Inyectar parámetros de paginación si existen
      if (params) {
        const query = new URLSearchParams()
        if (params.page) query.append('page', String(params.page))
        if (params.limit) query.append('limit', String(params.limit))
        const queryString = query.toString()
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString
        }
      }

      const response = await apiFetch(url, { method: consult.method || 'GET' })

      if (response.ok) {
        return await response.json()
      }
      
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: true, 
        message: errorData.message || 'Error en la consulta de datos',
        status: response.status 
      }
    } catch (err) {
      console.error('[RendererService] Fetch error:', err)
      return { error: true, message: 'Error de conexión' }
    }
  }

  /**
   * Ejecuta una llamada a API basada en una definición de acción.
   */
  async executeApiCall(actionDef: any, payload: any, options?: { page?: number; limit?: number; moduleId?: string }): Promise<ActionExecutionResult> {
    if (!actionDef.endpoint) return { success: false, message: 'Endpoint no definido' }

    try {
      // 1. Resolución de la URL (soporta objeto endpoint y tokens)
      let url = DynamicParser.resolveEndpointUri(actionDef.endpoint, payload)
      
      // Inyectar parámetros de paginación si existen
      if (options) {
        const query = new URLSearchParams()
        if (options.page) query.append('page', String(options.page))
        if (options.limit) query.append('limit', String(options.limit))
        const queryString = query.toString()
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString
        }
      }

      // 2. Determinación del método (Prioridad: endpoint.method > actionDef.method > POST)
      const method = (typeof actionDef.endpoint === 'object' ? (actionDef.endpoint.method || actionDef.method) : actionDef.method) || 'POST'

      // 3. Selección del Cuerpo (bodySource / bodyField)
      const bodySource = actionDef.bodySource || actionDef.body || (typeof actionDef.endpoint === 'object' ? actionDef.endpoint.bodySource : undefined)
      let body: any = undefined

      if (method !== 'GET') {
        const hasFile = Object.values(payload).some(val => val instanceof File || val instanceof Blob)

        if (hasFile) {
          const formData = new FormData()
          Object.keys(payload).forEach(key => {
            const val = payload[key]
            if (val instanceof File || val instanceof Blob) {
              formData.append(key, val)
            } else if (val !== undefined && val !== null) {
              formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val))
            }
          })
          body = formData
        } else if (!bodySource || bodySource === 'form') {
          body = JSON.stringify(payload)
        } else {
          const raw = payload[bodySource]
          if (raw != null) {
            if (typeof raw === 'string') {
              try { body = JSON.parse(raw) } catch { body = { value: raw } }
              body = JSON.stringify(body)
            } else {
              body = JSON.stringify(raw)
            }
          }
        }
      }

      const headers: Record<string, string> = {}
      if (options?.moduleId) {
        headers['x-module-id'] = options.moduleId
      }

      const response = await apiFetch(url, {
        method: method.toUpperCase(),
        body,
        headers
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        return { success: true, data }
      } else {
        const err = await response.json().catch(() => ({ message: 'Error en la respuesta' }))
        return { success: false, message: err.message || 'Error en la operación' }
      }
    } catch (err) {
      console.error('[RendererService] executeApiCall error:', err)
      return { success: false, message: 'Error de conexión' }
    }
  }

  /**
   * Resuelve y prepara la definición de una acción (placeholders).
   */
  prepareAction(rawAction: any, payload: any): any {
    const actionDef = JSON.parse(JSON.stringify(rawAction))
    
    if (typeof actionDef.path === 'string') {
      actionDef.path = DynamicParser.resolveTemplate(actionDef.path, payload)
    }

    if (typeof actionDef.endpoint === 'string') {
       actionDef.endpoint = DynamicParser.resolveTemplate(actionDef.endpoint, payload)
    } else if (typeof actionDef.endpoint === 'object' && actionDef.endpoint !== null) {
       // Si es un objeto, resolvemos cada propiedad internamente
       if (actionDef.endpoint.uri) actionDef.endpoint.uri = DynamicParser.resolveTemplate(actionDef.endpoint.uri, payload)
       if (actionDef.endpoint.endpoint) actionDef.endpoint.endpoint = DynamicParser.resolveTemplate(actionDef.endpoint.endpoint, payload)
    }

    if (actionDef.params) {
      Object.keys(actionDef.params).forEach(k => {
        if (typeof actionDef.params[k] === 'string') {
          actionDef.params[k] = DynamicParser.resolveTemplate(actionDef.params[k], payload)
        }
      })
    }
    
    return actionDef
  }

  async getCommentStatus(resourceIds: string[]): Promise<Record<string, boolean>> {
    try {
      const response = await apiFetch(`http://localhost:4003/api/v1/notifications/comment-status?ids=${resourceIds.join(',')}`);
      if (response.ok) return await response.json();
      return {};
    } catch {
      return {};
    }
  }

  async getCommentDetail(resourceId: string): Promise<any> {
    try {
      const response = await apiFetch(`http://localhost:4003/api/v1/notifications/comment-detail?resourceId=${resourceId}`);
      if (response.ok) return await response.json();
      return null;
    } catch {
      return null;
    }
  }

  async saveComment(dto: any): Promise<ActionExecutionResult> {
    try {
      const response = await apiFetch(`http://localhost:4003/api/v1/notifications/tag`, {
        method: 'POST',
        body: JSON.stringify(dto),
        noEncrypt: true
      } as any);
      if (response.ok) return { success: true };
      return { success: false, message: 'Error al guardar el comentario' };
    } catch {
      return { success: false, message: 'Error de conexión' };
    }
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      const response = await apiFetch(`http://localhost:4001/api/v1/users/search/find?q=${query}`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  }

  async getAllUsersForMentions(): Promise<any[]> {
    try {
      const response = await apiFetch(`http://localhost:4001/api/v1/users/mentions/all`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  }
}

export const rendererService = new RendererService()
