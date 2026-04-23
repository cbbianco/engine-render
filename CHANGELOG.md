# Changelog - SolutionsNplusOne Monorepo

Todos los cambios notables en este proyecto (Backend y Frontend) serán documentados en este archivo.

## [1.3.1] - 2026-04-21
### 🛡️ Orchestration Robustness & UI Polish
- **Metodología**: Implementación de **"Zombie Session Self-Destruction"** en el bootstrap para evitar fallos de sincronización con tokens expirados.
- **Autoría**: Equipo de Solutions.

#### Frontend
- **Dual-Mapping Orchestration**: Soporte para mapeo dual en `useRendererOrchestrator`, permitiendo la coexistencia de placeholders (`{token}`) y mapeo directo de propiedades.
- **Security Guard**: Implementado bloqueo proactivo en `DynamicModuleView` para prevenir intentos de carga de metadatos en estados no autenticados.
- **UI Premium Polish**:
  - Rediseño de la pantalla de bloqueo con tipografía **Extra Bold (800)** y color azul primario corporativo.
  - Sincronización de color de placeholders con la identidad visual (azul transparente).
  - Mejora de contraste crítico en el componente `EmptyModuleState`.
  - Animaciones de hover enriquecidas en el Toolbar (Scale + Brightness).

#### Backend
- **Non-Destructive Hydration**: Refactorizado el `ModuleHydratorUtils` para preservar datos del usuario en el `bodyModel` durante el proceso determinista.
- **Recursive IA Merge**: Optimización del `deepMerge` en `ia.service.ts` para proteger estructuras anidadas (`schemaChild`) y opciones de selección ante sugerencias de la IA.
- **Module Service Sync**: Sincronización del puerto de servicio a `4001` conforme al entorno de producción.

## [1.3.0] - 2026-04-20
### 🎨 Brand Identity & Dynamic Hydration (Full Stack)
- **Metodología**: Consolidación de **Brand Identity Orchestration** para personalización total del cliente.
- **Autoría**: Equipo de Solutions.

#### Frontend
- **Dynamic Profile Hydration**: Sistema de sincronización automática de campos de perfil tras actualización exitosa.
- **Session Sync Logic**: Actualización reactiva de tokens y rutas de navegación (HATEOAS) sin recarga de página ni logout.
- **Total Branding Purge**: Eliminación masiva de más de 60 ocurrencias de azules hardcodeados (`#3c50e0`, `#465fff`, `#2b3bbd`) en componentes de tablas, facturas, breadcrumbs y Kanban.
- **TailAdmin Variable Aliasing**: Inyección dinámica de variables `--color-brand-*` para compatibilidad total con el sistema de diseño del dashboard.

#### Backend
- **User Record Consolidation**: Normalización de las respuestas de actualización de perfil para retornar el objeto de usuario hidratado y el nuevo conjunto de hypermedia controls (paths).

### 🛠️ Global Theme Engine
- **Metodología**: Refactorización de `getThemeCssVars` para soportar múltiples capas de estilos. El color por defecto ahora está vinculado a `var(--primary-color)`.
- **Branding Logic**: Centralización de colores de marca en el Customer API, eliminando dependencias de valores hardcodeados.

## [1.2.3] - 2026-04-19
### ✨ UI Refinement & Utility Refactor
- **Clean UI**: Eliminados encabezados y breadcrumbs redundantes en el componente Kanban para una integración premium con el layout del CRM.
- **Refactor**: Centralizada la lógica de normalización de módulos en `src/utils/module-utils.ts` conforme a estándares de arquitectura limpia.
- **Fix**: Optimizados los márgenes y acciones rápidas del tablero.

## [1.2.2] - 2026-04-19
### ✨ Kanban Premium & Rendering Engine Fix
- **Feature**: Rediseño total de `TaskKanbanNative.vue` con estética TailAdmin.
- **Draggable**: Integración de `vuedraggable` para movimiento real de tareas.
- **Fix**: Hotfix de orquestación para el módulo de tareas.

## [1.2.1] - 2026-04-19
### ✨ Estabilidad y Auth
- **Fix**: Funcionalidad de logout corregida.

---
*Este proyecto es mantenido bajo los estándares de calidad del Equipo de Solutions.*
