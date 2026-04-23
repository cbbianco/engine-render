import { toDirectImageUrl } from '@/utils/customer/logo'
import { ModuleService } from '@/services/core/ModuleService'
import { type AuthCss, DEFAULT_THEME_CSS } from '@/model/auth/css/auth.css.dto'
import * as themeCssPersist from '@/persistence/theme/theme.persistence'
import * as customerPersist from '@/persistence/customer/customer.persistence'
import * as sessionPersist from '@/persistence/auth/session.persistence'
import { setupModulesConfig } from '@/config/module/setup'
import { RoutingService, type RouteConfig } from '@/router/routing'
import type { Router } from 'vue-router'

/**
 * Inicializa el estado de autenticación y aplica configuraciones persistidas.
 * Se encarga de cargar el tema, logo y restaurar la sesión si existe.
 */
export const bootstrapAuth = async (store: any, router: Router) => {
  applySavedTheme(store)
  applySavedLogo(store)
  await restoreSessionAndModules(store, router)
}

/**
 * Aplica el tema CSS persistido o el por defecto.
 */
function applySavedTheme(store: any) {
  const savedCss = themeCssPersist.loadThemeCss()
  if (!savedCss) {
    store.themeCss = { ...DEFAULT_THEME_CSS }
    return
  }

  try {
    const parsed = JSON.parse(savedCss) as AuthCss
    store.themeCss = { ...DEFAULT_THEME_CSS, ...parsed }
  } catch {
    store.themeCss = { ...DEFAULT_THEME_CSS }
  }
}

/**
 * Aplica el logo configurado si existe.
 */
function applySavedLogo(store: any) {
  const savedLogo = customerPersist.loadLogo()
  if (savedLogo) {
    store.customerLogo = toDirectImageUrl(savedLogo)
  }
}

/**
 * Restaura la sesión del usuario, configura rutas dinámicas y carga módulos.
 */
async function restoreSessionAndModules(store: any, router: Router) {
  const { token, routesStr, domain, userName } = sessionPersist.loadSession()
  if (!token || !routesStr) return

  try {
    const routes = JSON.parse(routesStr) as RouteConfig[]
    
    // 1. Restaurar estado básico
    store.sessionToken = token
    store.availableRoutes = routes
    store.customerDomain = domain ?? ''
    store.userName = userName ?? ''
    store.isAuthenticated = true

    // 2. Configurar rutas iniciales
    RoutingService.configureRoutes(router, routes)

    // 3. Sincronizar con el catálogo remoto (Actualiza rutas si cambiaron)
    await syncModules(store, router, token)

    // 4. Redirigir si es necesario
    handleInitialRedirect(router, store.availableRoutes)
  } catch (e: any) {
    console.error('[Bootstrap] Failed to restore session', e)
    // Forzamos logout para liberar la UI de estados inconsistentes
    store.logout()
  }
}

/**
 * Consulta el catálogo de módulos y actualiza las rutas dinámicas y la persistencia.
 */
async function syncModules(store: any, router: Router, token: string) {
  try {
    const moduleService = new ModuleService()
    const { ok: okModules, data: modules, path: newPaths } = await moduleService.getAll(token)

    if (okModules && newPaths && newPaths.length > 0) {
      store.availableRoutes = newPaths as RouteConfig[]
      RoutingService.configureRoutes(router, store.availableRoutes)
      
      sessionPersist.persistSession(
        token,
        store.availableRoutes,
        store.customerDomain,
        store.userName
      )
      setupModulesConfig(store, modules ? (modules as any) : [])
    } else {
      // Si el catálogo falla (404/401/Invalid), la sesión ya no es válida. Limpiamos todo.
      console.error('[Bootstrap] El catálogo de módulos no es accesible. Limpiando sesión zombi...')
      store.logout()
    }
  } catch (e) {
    console.error('[Bootstrap] Error syncing modules:', e)
    store.logout()
  }
}

/**
 * Maneja la redirección inicial tras restaurar la sesión.
 */
function handleInitialRedirect(router: Router, routes: RouteConfig[]) {
  const mainPath = RoutingService.getRedirectPath(routes) ?? '/'
  const currentPath = router.currentRoute.value.path

  if (currentPath !== mainPath) {
    router.replace(mainPath)
  } else if (router.currentRoute.value.matched.length === 0) {
    router.replace(router.currentRoute.value.fullPath)
  }
}
