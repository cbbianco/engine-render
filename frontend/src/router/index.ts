import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

/** Guardia: solo permite rutas definidas en el arreglo path del usuario autenticado. */
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const allowedPaths = authStore.availableRoutes
    .filter((r) => r.pathActive === 1)
    .map((r) => r.path)
  const isAllowed = 
    allowedPaths.length === 0 || 
    allowedPaths.includes(to.path) || 
    to.path.startsWith('/modules/')

  if (!isAllowed && to.path !== '/') {
    const first = allowedPaths[0]
    next(first ?? '/')
    return
  }
  next()
})

export default router
