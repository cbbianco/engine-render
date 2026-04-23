import type { Component } from 'vue'
import type { Router } from 'vue-router'

export interface RouteConfig {
  method: string
  path: string
  pathActive: number
}

/**
 * Servicio encargado de la gestión de rutas dinámicas y lógica de navegación.
 * Centraliza la configuración del router basada en la respuesta del backend.
 */
export class RoutingService {
  /**
   * Registra rutas dinámicas basadas en la configuración enviada por el backend.
   * Solo se cargan las que tienen pathActive === 1.
   * @param router Instancia de Vue Router
   * @param routes Lista de configuraciones de rutas
   */
  static configureRoutes(router: Router, routes: RouteConfig[]) {
    // Los paths relativos dependen de dónde se ubique este archivo (src/router/)
    const viewModules = import.meta.glob('../views/*.vue')
    const dynamicView = () => import('../views/DynamicModuleView.vue')
    const editView = () => import('../views/EditModuleView.vue')

    // 1. Rutas Dinámicas desde Backend (Tienen prioridad)
    routes.forEach((route) => {
      if (route.pathActive !== 1) return
      const pathSegments = route.path.split('/').filter(Boolean)
      if (pathSegments.length > 0) {
        router.addRoute({
          path: route.path,
          name: route.path.substring(1).replace(/\//g, '-'),
          component: dynamicView as () => Promise<Component>
        })
      }
    })

    // 2. Ruta de Edición/Detalle Inteligente (Menor prioridad)
    router.addRoute({
      path: '/modules/:moduleId',
      name: 'module-edit-detail',
      component: editView as () => Promise<Component>
    })

    // Ruta 404 genérica si existe el componente
    const notFoundPath = '../views/NotFoundView.vue'
    if (viewModules[notFoundPath]) {
      router.addRoute({
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: viewModules[notFoundPath] as () => Promise<Component>
      })
    }
  }

  /**
   * Obtiene el path de la primera ruta activa en el conjunto dado.
   * @param routes Lista de configuraciones de rutas
   */
  static getFirstActiveRoute(routes: RouteConfig[]): string | null {
    const active = routes.find((r) => r.pathActive === 1)
    return active ? active.path : null
  }

  /**
   * Determina la ruta de redirección ideal basada en prioridades y rutas activas.
   * @param routes Lista de configuraciones de rutas
   * @param preferredPath Path que se prefiere para la redirección (ej. '/dashboard')
   */
  static getRedirectPath(
    routes: RouteConfig[],
    preferredPath: string = '/dashboard'
  ): string | null {
    const activeRoutes = routes.filter((r) => r.pathActive === 1)

    // 1. Intentar con el path preferido
    const preferred = activeRoutes.find((r) => r.path === preferredPath)
    if (preferred) return preferred.path

    // 2. Fallback a la primera ruta activa disponible
    const first = activeRoutes[0]
    return first ? first.path : null
  }
}
