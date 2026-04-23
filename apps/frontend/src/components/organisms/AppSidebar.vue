<template>
  <aside
    :class="[
      'layout-sidebar',
      (isExpanded || isMobileOpen || isHovered) ? 'layout-sidebar--wide' : 'layout-sidebar--narrow',
      isMobileOpen ? 'layout-sidebar--mobile-open' : 'layout-sidebar--mobile-closed',
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div class="layout-sidebar__logo">
      <router-link :to="dashboardPath">
        <template v-if="customerLogo && (isExpanded || isHovered || isMobileOpen)">
          <img :src="customerLogo" alt="Logo" />
        </template>
        <span v-else>CRM</span>
      </router-link>
    </div>
    <div class="layout-sidebar__nav no-scrollbar">
      <nav>
        <div v-for="(section, sectionIndex) in menuSections" :key="sectionIndex" class="layout-sidebar__section">
          <h2 class="layout-sidebar__group-title">
            <template v-if="isExpanded || isHovered || isMobileOpen">
              {{ section.title }}
            </template>
            <HorizontalDots v-else />
          </h2>
          <ul class="layout-sidebar__list">
            <template v-for="(node, nodeIndex) in section.nodes" :key="node.type === 'link' ? node.path : `parent-${node.name}-${nodeIndex}`">
              <!-- Ítem simple (enlace directo) -->
              <li v-if="node.type === 'link'">
                <router-link
                  :to="node.path"
                  :class="[
                    'menu-item',
                    isActive(node.path) ? 'menu-item--active' : 'menu-item--inactive',
                  ]"
                >
                  <span
                    :class="[
                      'menu-item__icon',
                      isActive(node.path) ? 'menu-item__icon--active' : 'menu-item__icon--inactive',
                    ]"
                  >
                    <div v-if="isValidSvg(node.icon)" v-html="extractSvg(node.icon)" class="sidebar-icon-svg"></div>
                    <component v-else :is="node.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item__text">
                    {{ node.name }}
                  </span>
                </router-link>
              </li>
              <!-- Padre expandible con hijos (estilo TailAdmin: Forms > Form Elements) -->
              <li v-else-if="node.type === 'parent'" class="menu-parent-wrap">
                <div
                  :class="[
                    'menu-parent',
                    isParentActive(node) ? 'menu-parent--active' : 'menu-parent--inactive',
                  ]"
                  @click="toggleParent(sectionIndex, node.name)"
                >
                  <span
                    :class="[
                      'menu-item__icon',
                      isParentActive(node) ? 'menu-item__icon--active' : 'menu-item__icon--inactive',
                    ]"
                  >
                    <div v-if="isValidSvg(node.icon)" v-html="extractSvg(node.icon)" class="sidebar-icon-svg"></div>
                    <component v-else :is="node.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item__text">
                    {{ node.name }}
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-parent__chevron"
                    :class="{ 'menu-parent__chevron--open': isParentExpanded(sectionIndex, node.name) }"
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                <ul
                  v-show="(isExpanded || isHovered || isMobileOpen) && isParentExpanded(sectionIndex, node.name)"
                  v-if="node.children?.length"
                  class="menu-children"
                >
                  <li v-for="child in node.children" :key="child.path">
                    <router-link
                      :to="child.path"
                      :class="[
                        'menu-item menu-item--child',
                        isActive(child.path) ? 'menu-item--active' : 'menu-item--inactive',
                      ]"
                    >
                      <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item__text">
                        {{ child.name }}
                      </span>
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { GridIcon, UserCircleIcon, HorizontalDots, ChevronDownIcon } from '@/icons'
import { useSidebar } from '@/composables/useSidebar'
import { useAuthStore } from '@/stores/auth/index'
import { storeToRefs } from 'pinia'

const route = useRoute()
const { isExpanded, isMobileOpen, isHovered } = useSidebar()
const authStore = useAuthStore()
const { customerLogo } = storeToRefs(authStore)

/** Estado expandido por clave "sectionIndex-parentName" (estilo TailAdmin: Forms expandido para ver hijos). */
const expandedParents = ref<Record<string, boolean>>({})

function parentKey(sectionIndex: number, parentName: string): string {
  return `${sectionIndex}-${parentName}`
}

function isParentExpanded(sectionIndex: number, parentName: string): boolean {
  return !!expandedParents.value[parentKey(sectionIndex, parentName)]
}

function toggleParent(sectionIndex: number, parentName: string): void {
  const key = parentKey(sectionIndex, parentName)
  expandedParents.value = { ...expandedParents.value, [key]: !expandedParents.value[key] }
}

const dashboardPath = computed(() => {
  const hasDashboard = authStore.availableRoutes.some(
    (r) => r.path === '/dashboard' && r.pathActive === 1
  )
  return hasDashboard ? '/dashboard' : authStore.getFirstActiveRoute() ?? '/'
})

const activeRoutes = computed(() => {
  const active = authStore.availableRoutes.filter((r) => r.pathActive === 1)
  const dashboard = active.find((r) => r.path === '/dashboard')
  const profile = active.find((r) => r.path === '/profile')
  const rest = active.filter((r) => r.path !== '/dashboard' && r.path !== '/profile')
  const ordered: typeof active = []
  if (dashboard) ordered.push(dashboard)
  if (profile) ordered.push(profile)
  ordered.push(...rest)
  return ordered
})

function labelForPath(path: string): string {
  if (path === '/profile') return 'Mi perfil'
  return path
    .replace(/^\//, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function iconForPath(path: string, moduleIcon?: string | { name: string; svg: string }) {
  if (moduleIcon) return moduleIcon
  if (path === '/profile') return UserCircleIcon
  return GridIcon
}

function isValidSvg(icon: any): boolean {
  if (typeof icon === 'string' && icon.trim().startsWith('<svg')) return true
  if (typeof icon === 'object' && icon !== null && icon.svg) return true
  return false
}

function extractSvg(icon: any): string {
  if (typeof icon === 'string') return icon
  return icon.svg || ''
}

type MenuIcon = typeof GridIcon | string | { name: string; svg: string }
type MenuLink = { type: 'link'; path: string; name: string; icon: MenuIcon }
type MenuParent = {
  type: 'parent'
  name: string
  icon: MenuIcon
  children: { path: string; name: string }[]
}
type MenuNode = MenuLink | MenuParent

/**
 * Secciones del menú (estilo TailAdmin: MENU, SUPPORT, OTHERS).
 * Cada sección tiene nodos: enlace simple (menu:Modulo) o padre con hijos (menu-item:Usuarios:Crear).
 */
const menuSections = computed(() => {
  const sectionMap: Record<string, MenuNode[]> = {}

  activeRoutes.value.forEach((r) => {
    const segment = r.path.replace(/^\//, '').split('/')[0] || ''
    const cleanPath = r.path.replace(/^\//, '')
    const moduleForRoute = (authStore.modulesConfig ?? []).find((mod) => {
      const cfg = mod.configurationUi?.config
      const cfgPath = (cfg?.path ?? '').toString().replace(/^\//, '')
      const metaModule = (cfg?.metadata?.module ?? (cfg as any)?.module ?? '').toString().replace(/^\//, '')
      const moduloField = (mod.modulo ?? '').toString().replace(/^\//, '')
      
      return (
        cfgPath === cleanPath ||
        metaModule === cleanPath ||
        moduloField === cleanPath ||
        cfgPath === segment ||
        metaModule === segment ||
        moduloField === segment
      )
    })

    let menuConf = moduleForRoute?.configurationUi?.config?.menu
    let sectionTitle = 'MENU'
    let itemName = labelForPath(r.path)
    let parentName = ''
    let childName = ''
    let isParent = false

    // Normalize menu config (object or string)
    if (menuConf && typeof menuConf === 'object') {
      const m = menuConf as any
      if (m.parent && m.child && m.parent !== m.child) {
        parentName = m.parent
        childName = m.child
        isParent = true
      } else if (m.child) {
        itemName = m.child
      }
    } else if (typeof menuConf === 'string') {
      if (menuConf.startsWith('menu-item:')) {
        const parts = menuConf.split(':')
        parentName = parts[1] || 'Menú'
        childName = parts[2] || itemName
        isParent = true
      } else if (menuConf.startsWith('menu:')) {
        const parts = menuConf.split(':')
        itemName = parts[1] || itemName
      }
    }

    // Fallback logic for legacy /user path
    if (!isParent && (segment === 'user' || r.path === '/user')) {
      parentName = 'Usuarios'
      childName = 'Crear'
      isParent = true
    }

    if (isParent) {
      const nodes = sectionMap[sectionTitle] ?? (sectionMap[sectionTitle] = [])
      const existing = nodes.find(
        (n): n is MenuParent => n.type === 'parent' && n.name === parentName
      )
      if (existing && existing.type === 'parent') {
        existing.children.push({ path: r.path, name: childName })
      } else {
        nodes.push({
          type: 'parent',
          name: parentName,
          icon: iconForPath(r.path, moduleForRoute?.configurationUi?.config?.icon),
          children: [{ path: r.path, name: childName }]
        })
      }
      return
    }

    const nodesLink = sectionMap[sectionTitle] ?? (sectionMap[sectionTitle] = [])
    nodesLink.push({
      type: 'link',
      path: r.path,
      name: itemName,
      icon: iconForPath(r.path, moduleForRoute?.configurationUi?.config?.icon)
    } as MenuLink)
  })

  return Object.entries(sectionMap).map(([title, nodes]) => ({ title, nodes }))
})

/** Si la ruta actual es uno de los hijos del padre, el padre está "activo". */
function isParentActive(node: MenuParent): boolean {
  if (node.type !== 'parent') return false
  return node.children.some((c) => route.path === c.path)
}

/** Auto-expandir el padre que contiene la ruta activa. */
watch(
  () => route.path,
  (path) => {
    menuSections.value.forEach((section, sectionIndex) => {
      section.nodes.forEach((node) => {
        if (node.type === 'parent' && node.children.some((c) => c.path === path)) {
          const key = parentKey(sectionIndex, node.name)
          expandedParents.value = { ...expandedParents.value, [key]: true }
        }
      })
    })
  },
  { immediate: true }
)

function isActive(path: string) {
  return route.path === path
}
</script>

<style scoped>
/* Ensure SVG icons have consistent sizing in the sidebar */
:deep(.sidebar-icon-svg) svg {
  width: 24px;
  height: 24px;
  display: block;
}
</style>
