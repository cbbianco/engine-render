import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type AuthCss, DEFAULT_THEME_CSS } from '@/model/auth/css/auth.css.dto'
import { type LoginTexts, mergeLoginTexts } from '@/model/auth/login-texts.dto'
import type { ModuleConfigResponse } from '@/lib/types/module'
import { RoutingService, type RouteConfig } from '@/router/routing'
import { domainManager } from '@/utils/customer/domain'
import type { LoginSuccessData } from '@/services/auth/AuthService'
import * as sessionPersist from '@/persistence/auth/session.persistence'
import { setupModulesConfig } from '@/config/module/setup'

/**
 * Store de Autenticación.
 * Gestiona el estado reactivo de la sesión del usuario.
 */
export const useAuthStore = defineStore('auth', () => {
  const initialToken = ref<string>('')
  const sessionToken = ref<string>('')
  const isAuthenticated = ref(false)
  const availableRoutes = ref<RouteConfig[]>([])
  const themeCss = ref<AuthCss>({ ...DEFAULT_THEME_CSS })
  const customerLogo = ref<string>('')
  const loginTexts = ref<LoginTexts>(mergeLoginTexts(null))
  const customerDomain = ref<string>(domainManager.domain)
  const userName = ref<string>('')
  const modulesConfig = ref<ModuleConfigResponse[]>([])
  const isReauthenticating = ref(false)
  const publicKey = ref<string>('')

  /**
   * Actualiza el estado del store tras un login o re-autenticación exitosa.
   */
  const authenticated = (payload: LoginSuccessData, identifier: string) => {
    const { apiResponse, modules, finalPaths, theme } = payload
    
    sessionToken.value = apiResponse.access_token
    availableRoutes.value = finalPaths
    customerDomain.value = identifier.trim()
    userName.value = identifier.trim()
    isAuthenticated.value = true
    isReauthenticating.value = false // Reset reauth state upon successful authentication
    if (theme) {
      themeCss.value = theme
    }

    // Configuración de módulos UI
    setupModulesConfig(this === undefined ? useAuthStore() : this, modules)
  }

  /**
   * Actualiza parcialmente la sesión actual (Token y Rutas) sin cambiar el dominio.
   */
  const updateSession = (token: string, routes: RouteConfig[], newUserName?: string) => {
    sessionToken.value = token
    availableRoutes.value = routes
    if (newUserName) {
      userName.value = newUserName.trim()
    }
    isReauthenticating.value = false // Also reset here for partial session updates
    
    // Persistencia local
    sessionPersist.persistSession(token, routes, customerDomain.value, userName.value)
  }

  /**
   * Limpia el estado reactivo (el AuthService se encarga de la persistencia y recarga).
   */
  const clearState = () => {
    sessionToken.value = ''
    availableRoutes.value = []
    isAuthenticated.value = false
    modulesConfig.value = []
    userName.value = ''
  }

  /**
   * Cierra la sesión del usuario, limpia el almacenamiento y redirige al inicio.
   */
  const logout = () => {
    clearState()
    sessionPersist.clearSession()
    
    // Borrado agresivo de todo rastro de datos
    localStorage.clear()
    sessionStorage.clear()

    // Eliminar cookies de sesión si existieran
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Notificación en consola para auditoría
    console.log('[Auth] Session terminated and cleared successfully');
    
    // Forzar recarga completa para resetear todos los estados de la aplicación
    window.location.href = '/'
  }

  return {
    initialToken,
    sessionToken,
    isAuthenticated,
    availableRoutes,
    themeCss,
    customerLogo,
    loginTexts,
    customerDomain,
    userName,
    modulesConfig,
    authenticated,
    updateSession,
    clearState,
    logout,
    getFirstActiveRoute: () => RoutingService.getFirstActiveRoute(availableRoutes.value),
    getPostLoginRedirectPath: () => RoutingService.getRedirectPath(availableRoutes.value, '/dashboard'),
    isReauthenticating,
    publicKey,
  }
})
