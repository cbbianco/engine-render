import { HttpClient } from '@/services/core/http/HttpClient'

const DEFAULT_BASE = import.meta.env.VITE_MODULE_API_BASE_URL ?? 'http://localhost:4002'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface DispatchOptions {
  endpoint: string
  method?: HttpMethod
  /** Nombre del campo del model con el payload (p. ej. bodySource: "input_body"). Se parsea como JSON real antes de enviar el POST. */
  bodyField?: string
  model: Record<string, unknown>
  headers?: Record<string, string>
}

/**
 * Reemplaza tokens en la URI: {input_uri} -> model['input_uri'], {tag} -> model['tag'], etc.
 * Así la URL del POST puede venir del formulario (campo Uri de Endpoint).
 */
function replaceUriTokens(uri: string, model: Record<string, unknown>): string {
  return uri.replace(/\{(\w+)\}/g, (_, key) => {
    const val = model[key]
    return val != null ? String(val) : ''
  })
}

/**
 * Cuerpo del POST: cuando el botón tiene bodySource (ej. "input_body"), se toma model[bodySource],
 * se parsea como JSON real y se envía. Si bodySource es "form", se envía el model completo.
 */
function buildBody(bodyField: string | undefined, model: Record<string, unknown>): unknown {
  if (!bodyField) return undefined
  if (bodyField === 'form') return { ...model }
  const raw = model[bodyField]
  if (raw == null) return undefined
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return { value: raw }
    }
  }
  return raw
}

export class ApiDispatcher {
  private readonly http: HttpClient

  constructor(baseUrl: string = DEFAULT_BASE) {
    this.http = new HttpClient(baseUrl)
  }

  async dispatch<T = unknown>(options: DispatchOptions): Promise<{ status: number; data?: T }> {
    const { endpoint, model, headers = {} } = options
    const method = (options.method ?? 'GET').toUpperCase() as HttpMethod
    const uri = replaceUriTokens(endpoint, model)
    const body = buildBody(options.bodyField, model)

    if (method === 'GET') {
      return this.http.get<T>(uri, headers)
    }
    if (method === 'POST') {
      return this.http.post<T>(uri, body, headers)
    }
    if (method === 'PUT') {
      return this.http.put<T>(uri, body, headers)
    }
    if (method === 'DELETE') {
      return this.http.delete<T>(uri, headers)
    }
    if (method === 'PATCH') {
      return this.http.patch<T>(uri, body, headers)
    }

    return this.http.request<T>(method, uri, { body, headers })
  }
}
