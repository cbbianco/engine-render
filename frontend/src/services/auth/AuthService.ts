import { HttpClient } from '@/services/core/http/HttpClient'
import type { AuthApiResponse } from '@/model/auth/auth-api.response.dto'
import { type AuthCss, DEFAULT_THEME_CSS } from '@/model/auth/css/auth.css.dto'
import * as themeCssPersist from '@/persistence/theme/theme.persistence'
import * as sessionPersist from '@/persistence/auth/session.persistence'
import { ModuleService } from '@/services/core/ModuleService'
import { type RouteConfig } from '@/router/routing'
import { MessageService } from '@/services/core/messages'

const BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:4001'

export type LoginSuccessData = {
  apiResponse: AuthApiResponse
  modules: any[]
  finalPaths: RouteConfig[]
  theme: AuthCss | null
}

export type LoginResult =
  | { success: true; payload: LoginSuccessData }
  | { success: false; status: number; title?: string; message?: string }

/**
 * Servicio de Autenticación y Orquestación.
 * Gestiona el ciclo de vida de la sesión (llamadas a API y preparación de datos).
 */
export class AuthService {
  private readonly http: HttpClient
  private readonly moduleService: ModuleService

  constructor(baseUrl: string = BASE_URL) {
    this.http = new HttpClient(baseUrl)
    this.moduleService = new ModuleService()
  }

  /**
   * Realiza el login y retorna los datos necesarios para hidratar la aplicación.
   * Ya no depende ni del store ni del router directamente.
   */
  async login(
    credentials: { domainOrUsername: string; password: string; initialToken: string },
    loginTextsModal?: any
  ): Promise<LoginResult> {
    const { domainOrUsername, password, initialToken } = credentials

    try {
      // 1. Llamada a la API de autenticación
      const { status, data } = await this.http.post<AuthApiResponse>(
        '/api/v1/users/auth',
        { userName: domainOrUsername, password },
        { Authorization: `Bearer ${initialToken}` }
      )

      const okStatus = status >= 200 && status < 300
      if (!okStatus || !data) {
        const errorInfo = MessageService.messageForStatus(status, loginTextsModal)
        return { success: false, status, ...errorInfo }
      }

      // SOPORTE: Nueva estructura { data: { access_token, ... }, path: [] }
      const response = data as any
      const finalData = response.data || response
      const finalPaths = (response.path || finalData.path || []) as RouteConfig[]

      // 2. Procesar Tema (Solo si viene en la respuesta, para no pisar el del customer)
      const themeFromApi = (finalData.css ?? finalData.colorCss) as AuthCss | undefined
      const finalTheme = (themeFromApi && Object.keys(themeFromApi).length > 0) ? { ...DEFAULT_THEME_CSS, ...themeFromApi } : null

      // 3. Orquestación de Módulos (Carga de Catálogo completa si es posible)
      const { modules, finalPaths: updatedPaths } = await this.fetchModules(finalData.access_token, finalPaths)

      // 4. Persistencia (Lado Servicio)
      this.persistInitialData(finalData.access_token, updatedPaths, domainOrUsername, finalTheme)

      return {
        success: true,
        payload: {
          apiResponse: finalData,
          modules,
          finalPaths: updatedPaths,
          theme: finalTheme
        }
      }
    } catch (error) {
      console.error('[AuthService] Unexpected login error:', error)
      const errorInfo = MessageService.messageForStatus(500, loginTextsModal)
      return { success: false, status: 500, ...errorInfo }
    }
  }

  /**
   * Cierra la sesión y limpia la persistencia.
   */
  logout(): void {
    sessionPersist.clearSession()
    window.location.reload()
  }

  /**
   * Persiste datos en almacenamiento local (no reactivo).
   */
  private persistInitialData(token: string, paths: RouteConfig[], domain: string, theme: AuthCss | null): void {
    sessionPersist.persistSession(token, paths, domain, domain)
    if (theme) {
      themeCssPersist.persistThemeCss(theme)
    }
  }

  /**
   * Obtiene módulos y actualiza rutas si es necesario.
   */
  private async fetchModules(token: string, initialPaths: RouteConfig[]): Promise<{ modules: any[]; finalPaths: RouteConfig[] }> {
    try {
      const { ok: okModules, data: modules, path: newPaths } = await this.moduleService.getAll(token)
      
      const finalPaths = (okModules && newPaths && newPaths.length > 0) 
        ? (newPaths as RouteConfig[]) 
        : initialPaths

      return {
        modules: okModules && modules ? modules : [],
        finalPaths
      }
    } catch (e) {
      console.error('[AuthService] Error fetching modules:', e)
      return { modules: [], finalPaths: initialPaths }
    }
  }
}
