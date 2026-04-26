# Frontend Complexity Metrics

This report details the complexity metrics for the primary files in the frontend application.

## Complexity Thresholds
- **Cyclomatic Complexity**: 15 (Critical > 20)
- **Cognitive Complexity**: 15 (Critical > 25)

## Analysis Results

| File Path | Cyclomatic | Cognitive | LOC | Status |
| :--- | :---: | :---: | :---: | :--- |
| `useRendererOrchestrator.ts` | **234** | **229** | 674 | 🔴 Critical Refactor |
| `DynamicRenderer.utils.ts` | **77** | **90** | 269 | 🔴 Critical Refactor |
| `DynamicRenderer.vue` | **56** | 19 | 297 | 🟡 Refactor Recommended |
| `AuthService.ts` | 18 | 15 | 130 | 🟢 Acceptable |
| `RoutingService.ts` (routing.ts) | 7 | 14 | 87 | 🟢 Healthy |
| `authStore/index.ts` | 5 | 9 | 128 | 🟢 Healthy |

## Critical Findings

### 1. `useRendererOrchestrator.ts` (Complexity: 234 / 229)
This file represents **1560%** of the recommended cyclomatic complexity threshold. It has become a "God Object" or "God Composable" that handles too many responsibilities including state management, validation logic, API orchestration, and internal navigation.

**Recommendation**: 
- Split into specialized composables: `useRendererState`, `useRendererValidation`, `useRendererNavigation`, `useRendererApi`.
- Move business logic to separate service layers.

### 2. `DynamicRenderer.utils.ts` (Complexity: 77 / 90)
Static utilities are overloaded with complex conditional logic for style resolution and data normalization.

**Recommendation**:
- Split into smaller utility classes: `StyleResolver`, `DataNormalizer`, `Validator`.

## Refactoring List (Candidates > 100% Threshold)
1. `apps/frontend/src/composables/renderer/useRendererOrchestrator.ts`
2. `apps/frontend/src/utils/renderer/DynamicRenderer.utils.ts`
3. `apps/frontend/src/lib/components/DynamicRenderer.vue` (due to high cyclomatic complexity in template/logic)
