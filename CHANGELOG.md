# Changelog - SolutionsNplusOne Monorepo

Todos los cambios notables en este proyecto (Backend y Frontend) serán documentados en este archivo.

## [1.14.0] - 2026-04-26
### Added
- **Persistent Notification System (EDP)**: New microservice `ms-notifications` (Port 4003) for long-term notification storage in MongoDB.
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
