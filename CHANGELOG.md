# Changelog - SolutionsNplusOne Monorepo

Todos los cambios notables en este proyecto (Backend y Frontend) serán documentados en este archivo.

## [1.15.0] - 2026-04-26
### Added
- **Secure ID-Based Notification System**: Standardized all notifications to use User IDs instead of names, ensuring data integrity and cross-browser security.
- **Global Mention & Tagging Engine**: Implemented a robust system to tag ANY user in the system via `@username`.
- **Real-Time Notification Reactivity**: Added 10s global polling in the `NotificationStore` to automatically update the bell counter and show Toasts without user interaction.
- **Persistent Comment Status**: Implemented a "Checkmark" system in tables that persists across page refreshes, indicating which records have already been commented.
- **Advanced Mention Autocomplete**: Created a specialized endpoint in `ms-users` to provide a global user list for tagging in any module.
- **Notification Deduplication**: Added a smart filter in the frontend and backend to avoid duplicate "Sesión Iniciada" or tag notifications within short timeframes.

### Changed
- **JWT-Enforced Backend**: Secured all `ms-notifications` endpoints using `AuthGuard`, extracting user identity directly from the JWT token.
- **Optimized Mention Processing**: Removed redundant microservice calls during mention resolution by passing direct user IDs from the frontend.
- **Enhanced Notification Store**: Refactored the store to use atomic updates and content-based deduplication for 100% reliable UI synchronization.

### Fixed
- **Counter Desync**: Fixed a bug where the notification count was not updating automatically until a manual click occurred.
- **Disappearing Checkmarks**: Resolved an issue where the table "Success" icon would disappear after a page refresh.
- **Vanishing Modal Content**: Fixed the comment detail retrieval to ensure the modal correctly displays previously saved text when reopened.
- **Duplicate Toasts**: Eliminated the "cascade" of duplicate toasts when multiple notification sources synced simultaneously.


## [1.14.0] - 2026-04-26
### Added
- **Persistent Notification System (EDP)**: New microservice `ms-notifications` (Port 4003) for long-term notification storage in MongoDB.
- **Master Inventory Template**: Created a comprehensive `inventory.json` module for professional product management, stock control, and pricing.
- **Automatic Notification Cleanup**: Integrated `@nestjs/schedule` for automatic removal of old notifications (>7 days).
- **Zero-Latency Read Status**: Fully event-driven (EDP) system for marking notifications as read, ensuring instant UI response without blocking network calls.
- **Notification History Hydration**: Automatic loading of historical notifications from the backend upon login or bell interaction.

### Changed
- **Architectural Flattening**: Simplified the `ms-notifications` module structure (removing subfolders like `service/`, `controller/`) to resolve IDE module resolution issues and streamline development.
- **Orchestrator Purification**: Cleaned up `useRendererOrchestrator.ts` by delegating 100% of click and submit logic to `ClickUtils.ts`, reducing cyclomatic complexity from 52 to 14.
- **Universal Data Setting**: Refactored `initModel` to support hybrid responses. It now preserves the full structure for complex components (Tables/Kanban) while flattening data for simple forms.
- **Restored Smart Binding**: Re-implemented the logic that allows complex components to receive the full model when their specific property is empty, ensuring tables display correctly.
- **Fixed Action Interception**: Removed a hardcoded interceptor that was blocking 'navigate' actions for edit buttons, restoring the standard navigation flow for all modules.

### Fixed
- **Module ID Resolution**: Fixed a critical 404 error in the user list by ensuring `{moduleId}` placeholders are correctly resolved in the orchestration engine.
- **Persistent Path Resolution**: Resolved "Cannot find module" errors in `ms-notifications` by standardizing imports and using barrel files (`index.ts`).
- **Data Binding Sync**: Fixed a bug where form fields (Profile) were not populating correctly due to missing response unwrapping.
- **Syntax Stabilization**: Fixed critical "catch or finally expected" and "try expected" errors in the orchestrator caused by missing braces.

## [1.12.0] - 2026-04-26
### Added
- **Global Health Monitoring**: Implemented a comprehensive health metrics system in `METRICS.md`, categorizing files by decision-point density (Healthy, Needs Improvement, Critical).
- **Dead Code Cleanup**: Deleted deprecated files (`useModuleValidation.ts`, `create-assignation.dto.ts`) to reduce technical debt and maintain a clean monorepo.

### Changed
- **Documentation Reordering**: Reorganized all `.MD` files to follow a logical development flow (ReadMe -> Stack -> Metrics -> Changelog).
- **Architecture Refinement**: Finalized the extraction of orchestration logic into the "Realm of Actions" and "Realm of Values".
### Added
- **Click Event Utility**: Introduced `ClickUtils.ts` to centralize all logic for button clicks, breadcrumb navigation, and master-detail form submissions (`submit-master`).
- **Orchestration Context**: Implemented `ClickContext` to allow safe delegation of business logic from composables to utility classes.

### Changed
- **Orchestrator Slimming**: Reduced the complexity of `useRendererOrchestrator.ts` by another **25%**, reaching a "Healthy" status (52 cyclomatic).
- **Consolidated Navigation**: Centralized breadcrumb click handling to resolve same-route navigation issues.
### Fixed
- **Broken Utility References**: Resolved critical "Property does not exist" errors in `DynamicRenderer.vue` and `NestedModuleNative.vue` caused by the migration of `fieldKey` and `runValidation` to specialized utils.
- **Validation Engine Sync**: Fixed missing imports in `ModelUtils.ts` and `ModuleUtils.ts` to correctly connect with the new `ValidationUtils` chain.
