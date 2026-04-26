# Changelog - SolutionsNplusOne Monorepo

Todos los cambios notables en este proyecto (Backend y Frontend) serán documentados en este archivo.

## [1.10.0] - 2026-04-26
### Added
- **Facade Architecture**: Introduced `ModelUtils.ts` and `StyleUtils.ts` to de-couple logic from `useRendererOrchestrator.ts`, reducing its complexity by **70%**.
- **Flexible Navigation Interceptor**: Implemented a "Smart Resolution" guard in the orchestrator that prioritizes explicit action paths over circular ID resolutions, fixing the "User List -> Edit -> List" loop.

### Changed
- **Premium UI Standard**: Standardized **10px rounding** and **1.5px borders** across all core UI components (`AppButton`, `AppInput`, `ToolbarNative`).
- **Header Structural Realignment**: Redesigned `DynamicRenderer` header to align action buttons perfectly with breadcrumbs, improving visual balance and whitespace usage.
- **Improved Type Safety**: Enhanced `initModel` to prevent TypeScript/Vue warnings when initializing fields with placeholder tokens like `{res}`.

### Fixed
- **Circular Redirection**: Resolved critical issue where the User List "edit" action was incorrectly navigating back to the list due to metadata ID conflicts.
- **Component Style Overrides**: Fixed inconsistent button styles in parent-child module contexts by centralizing visual logic in `StyleUtils.ts`.

## [1.9.0] - 2026-04-26
### Added
- **Code Metrics Report**: Created `METRICS.md` to track Cyclomatic and Cognitive complexity across critical frontend files, establishing a baseline for future refactoring efforts.

### Changed
- **Utility Consolidation**: Moved and reorganized all renderer-related utilities (`DynamicRenderer.utils.ts`, `FormUtils.ts`, `ModuleUtils.ts`, `RouteUtils.ts`) from `src/lib/components/core` to a centralized `src/utils/renderer/` directory for better maintainability and discovery.
- **Code Cleanup**: Removed unused computed properties (`rawSchemaChildren`) and redundant destructuring (`backToMain`) in `DynamicRenderer.vue` as part of the "Zero-Waste Frontend" initiative.
- **Build Stabilization**: Fixed several TypeScript build errors related to missing props (`readonly`) and potential undefined values in input emitters across the component library.

### Fixed
- **Double Notification Bug**: Resolved an issue where the "Sesión Iniciada" notification was triggered twice during login by centralizing the notification logic within the authentication store.


## [1.8.0] - 2026-04-25
### Added
- **Global Notification System**: Implemented a real-time notification engine with `ToastNotification.vue` for push alerts and `NotificationBell.vue` for history tracking in the header.
- **Configurable TTL**: Added `VITE_NOTIFICATION_TTL_MINUTES` to control the automatic removal of notifications (default 5 minutes).
- **Deep Form Reset**: Enhanced `FormUtils.resetForm` to perform a deep cleanup of both parent and child (submodule) models after successful operations.
- **Automatic Orchestration Flow**: Implemented automatic navigation back to the parent component after successful submodule actions, ensuring a clean and intuitive workflow.

### Changed
- **Secure Logout Hardening**: Refactored the logout process to aggressively clear all session data including `localStorage`, `sessionStorage`, cookies, and Pinia stores to prevent unauthorized access via history or direct URL.
- **Reliable Iconography**: Replaced FontAwesome dependencies with native SVGs in critical UI components (Bell, Toasts) for consistent rendering across all environments.
- **Dynamic Field Preservation**: Updated the backend (`UsersController`, `UserCreationService`) to respect and preserve the original property names from the frontend (e.g., `logoFile`, `logoUrl`) instead of renaming them to `logoPath`.

### Fixed
- **UI Alignment Precision**: Fixed vertical alignment of the notification bell in the header and adjusted toast positioning to ensure zero overlap with critical UI elements.
- **Submodule State Isolation**: Improved state management during parent-child transitions to prevent data leakage between different orchestration levels.

## [1.7.0] - 2026-04-25
### Added
- **Session Protection Guard**: Enhanced `useRendererOrchestrator` to prevent unintentional session overwrites during resource creation (ensuring Admin session remains intact after creating new users).
- **Form Lifecycle Management**: Added automatic form reset logic after successful creation, ensuring a clean state for subsequent operations.

### Changed
- **Dynamic Orchestration Engine**: Transitioned to a 100% metadata-driven approach by removing static DTOs (`UserCreateDto`, `UserProfileDto`) in favor of dynamic `Record<string, unknown>` payloads.
- **Flexible Branding Service**: Updated `UserConfigService` to handle dynamic branding properties (colors, logos) with intelligent fallback logic for missing values in schemas.
- **Validation Source of Truth**: Backend validation now relies exclusively on the JSON schema defined in MongoDB via `ModuleValidationService`.

### Fixed
- **File Upload Preservation**: Fixed a critical bug in the orchestrator's filtering logic that was discarding `File` and `Blob` instances, enabling robust `multipart/form-data` support for logos.
- **Orchestrator Type Safety**: Resolved multiple TypeScript "unknown" type errors in `UserProfileService` and `UsersController` by implementing safe dynamic accessors.

## [1.6.0] - 2026-04-25
### Added
- **Domain Utility Layer**: New architecture for frontend utilities (`FormUtils`, `RouteUtils`) to handle domain logic outside the orchestrator.
- **Inactivity Detection System**: Configurable inactivity timeout via `VITE_INACTIVE_MINUTES` to trigger re-authentication.
- **Component Catalog**: Dedicated technical documentation for all renderable components in `templates/componentes`.

### Changed
- **Architectural Compliance (v2.2)**: Microservices (`ms-users`, `ms-customer`, `ms-modules`) elevated to 100% compliance with Facade/Orchestrator patterns.
- **IA Precision**: Set IA temperature to `0.0` for deterministic and technical module generation.
- **Nested Module UI**: Unified headers and improved equidistance between navigation buttons and titles.
- **Orchestration Logic**: Enhanced `submit-master` with global validation (Parent + Child) and automatic "back-to-parent" navigation on validation failure.

### Fixed
- **SelectNative Bug**: Fixed selection and display issues by normalizing `id` and `value` properties.
- **Validation Glitch**: Fixed false-positive configuration errors during initial hydration of "match" validation rules.

## [1.5.0] - 2026-04-25
### Added
- **Unified Orchestration**: Support for Master-Detail (Parent-Child) navigation within the same module view.
- **Unified Submission**: `submit-master` action that consolidates parent and child form data into a single API request.
- **Visual Customization**: Support for user-specific brand colors (primary, secondary, error) and logo management.
- **Local File Storage**: Backend support for local file uploads (Multer) for user logos in `ms-users`.
- **Mutual Exclusion UI**: Real-time reactive logic to handle Logo URL vs Logo File selection.

### Changed
- **Schema Stabilization**: Standardized all customization fields to strict **camelCase** (primary, secondary, errorColor) for full database compatibility.
- Refactored `NestedModuleNative` for robust schema resolution and dynamic field disabling.
- Updated `UserEntity` and `CreateUserDto` in `ms-users` to include visual metadata.
- Cleaned up legacy footer toolbar keys in `DynamicRenderer`.

## [1.4.0] - 2026-04-23
### 🚀 Monorepo Stabilization & Startup Orchestration
- **Metodología**: Implementación de **"Zero-Conflict Startup"** mediante limpieza automatizada de puertos y estandarización de orquestación.
- **Autoría**: Equipo de Solutions.

#### Monorepo & DevOps
- **Port Standardization**: Puertos fijos para desarrollo local:
  - `ms-customer`: **4000**
  - `ms-users`: **4001**
  - `ms-modules`: **4002**
  - `frontend`: **5173**
- **Startup Cleanup**: Integración de scripts de limpieza de puertos huérfanos para evitar errores `EADDRINUSE`.
- **Environment Injection**: Implementada carga robusta de `.env` (raíz y apps/) en todos los microservicios mediante `dotenv` y resolución dinámica de rutas.
- **Workspace Alignment**: Renombrado el paquete de frontend a `frontend` para total compatibilidad con los scripts de workspace de npm.

#### Frontend
- **TypeScript Alias Fix**: Restaurada la configuración de `tsconfig.json` para soporte nativo de alias `@/` y tipos globales de Vite.
- **Kanban Resilience**: Corregido fallo crítico de importación en `TaskKanbanNative.vue` y generados datos de demostración estables en `src/assets/data`.
- **API Dispatcher Sync**: Sincronizado el puerto por defecto de despacho de módulos al puerto 4002.
- **Documentation**: Creado el [Catálogo de Componentes](./CATALOGO.md) completo con ejemplos de esquemas JSON para cada componente del motor.

#### Backend
- **Microservices Entrypoint**: Refactorizados los archivos `main.ts` de todos los servicios para garantizar la carga de variables de entorno antes del bootstrap de NestJS.

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
