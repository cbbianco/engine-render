# Frontend Complexity Metrics - Engine-Render

This report details the complexity metrics for the primary files in the frontend application after the structural consolidation of utilities.

## Complexity Thresholds
- **Cyclomatic Complexity**: 15 (Critical > 20)
- **Cognitive Complexity**: 15 (Critical > 25)

## Analysis Results (Post-Consolidation)

| File Path | Cyclomatic | Cognitive | LOC | Status |
| :--- | :---: | :---: | :---: | :--- |
| `src/composables/renderer/useRendererOrchestrator.ts` | **234** | **229** | 674 | 🔴 Critical Refactor |
| `src/utils/renderer/DynamicRenderer.utils.ts` | **77** | **90** | 269 | 🔴 Critical Refactor |
| `src/lib/components/DynamicRenderer.vue` | **56** | 19 | 291 | 🟡 Refactor Recommended |
| `src/services/auth/AuthService.ts` | 18 | 15 | 130 | 🟢 Acceptable |
| `src/router/routing.ts` | 7 | 14 | 87 | 🟢 Healthy |
| `src/stores/auth/index.ts` | 5 | 9 | 128 | 🟢 Healthy |

## Critical Findings

### 1. `useRendererOrchestrator.ts` (Complexity: 234 / 229)
This file represents **1560%** of the recommended cyclomatic complexity threshold. It has become a "God Object" handleing too many responsibilities: state management, validation logic, API orchestration, and internal navigation.

**Recommendation**: 
- Split into specialized composables: `useRendererState`, `useRendererValidation`, `useRendererNavigation`, `useRendererApi`.
- Move business logic to separate service layers.

### 2. `DynamicRenderer.utils.ts` (Complexity: 77 / 90)
Moved to `src/utils/renderer/`. Static utilities are overloaded with complex conditional logic for style resolution and data normalization.

**Recommendation**:
- Split into smaller utility classes: `StyleResolver`, `DataNormalizer`, `Validator`.

## Refactoring List (Candidates > 100% Threshold)
1. `apps/frontend/src/composables/renderer/useRendererOrchestrator.ts`
2. `apps/frontend/src/utils/renderer/DynamicRenderer.utils.ts`
3. `apps/frontend/src/lib/components/DynamicRenderer.vue`
