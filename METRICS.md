# Frontend Complexity Metrics - Engine-Render

This report details the complexity metrics for the primary files in the frontend application after the structural consolidation and refactoring.

## Complexity Thresholds
- **Cyclomatic Complexity**: 15 (Critical > 20)
- **Cognitive Complexity**: 15 (Critical > 25)

## Analysis Results (Post-Refactor)

| File Path | Cyclomatic | Cognitive | LOC | Status |
| :--- | :---: | :---: | :---: | :--- |
| `src/composables/renderer/useRendererOrchestrator.ts` | **68** | **52** | 688 | 🟡 Improved (Still High) |
| `src/utils/renderer/DynamicRenderer.utils.ts` | **23** | 18 | 243 | 🟡 Refactor Recommended |
| `src/utils/renderer/ModelUtils.ts` | 5 | 4 | 42 | 🟢 Healthy |
| `src/utils/renderer/StyleUtils.ts` | 2 | 2 | 30 | 🟢 Healthy |
| `src/lib/components/DynamicRenderer.vue` | 5 | 3 | 293 | 🟢 Healthy |
| `src/services/auth/AuthService.ts` | 18 | 15 | 130 | 🟢 Acceptable |

## Critical Findings (Summary of Improvements)

### 1. `useRendererOrchestrator.ts` (Complexity: 234 → 68)
Massive reduction in complexity (**-70%**) achieved by delegating responsibilities to specialized utility files (`ModelUtils`, `ModuleUtils`, `FormUtils`). It now acts primarily as a Facade.

### 2. `DynamicRenderer.utils.ts` (Complexity: 77 → 23)
Simplified by moving style and model logic to dedicated files. The remaining logic is focused on core parsing and token resolution.

## Refactoring List (Candidates > 100% Threshold)
1. `apps/frontend/src/composables/renderer/useRendererOrchestrator.ts` (Remaining logic consolidation needed)
2. `apps/frontend/src/utils/renderer/DynamicRenderer.utils.ts`
