# Reporte de Salud y Métricas FullStack - Engine-Render

Este reporte detalla la salud técnica de **todos** los archivos del proyecto (Frontend y Backend) basándose en puntos de decisión (complejidad ciclomática proxy). 

## Escala de Salud
- **0% - 50%**: 🟢 **Saludable** (Mantenible y modular).
- **51% - 100%**: 🟡 **Necesita Mejora** (Candidato a revisión).
- **> 100%**: 🔴 **Candidato a Refactorización** (Complejidad crítica).

## 🎨 Análisis de Archivos Frontend (v1.16.0)

| Archivo | Puntos | Salud % | Estado |
| :--- | :---: | :---: | :--- |
| `src/components/pages/VisualEditor.vue` | 42 | 210% | 🔴 Refactorizar (Crecimiento Dinámico) |
| `src/components/atoms/special/DrawOwner.vue` | 37 | 185% | 🔴 Refactorizar |
| `src/services/renderer/RendererService.ts` | 32 | 160% | 🔴 Refactorizar |
| `src/components/atoms/table/TablePremium.vue` | 29 | 145% | 🔴 Refactorizar |
| `src/components/atoms/special/CommentModal.vue` | 22 | 110% | 🔴 Refactorizar |
| `src/stores/notifications/index.ts` | 15 | 75% | 🟡 Necesita Mejora |
| `src/components/organisms/AppSidebar.vue` | 19 | 95% | 🟡 Necesita Mejora |
| `src/views/EditModuleView.vue` | 15 | 75% | 🟡 Necesita Mejora |
| `src/composables/renderer/useRendererOrchestrator.ts` | 14 | 70% | 🟡 Mejorado |
| `src/utils/renderer/ClickUtils.ts` | 14 | 70% | 🟡 Necesita Mejora |
| `src/components/atoms/selection/SelectNative.vue` | 11 | 55% | 🟡 Necesita Mejora |
| `src/lib/components/core/ChainHandler.ts` | 11 | 55% | 🟡 Necesita Mejora |
| `src/utils/renderer/DynamicRenderer.utils.ts` | 10 | 50% | 🟢 Saludable |
| `src/utils/security/encryption.ts` | 10 | 50% | 🟢 Saludable |
| `src/utils/renderer/ValidationUtils.ts` | 9 | 45% | 🟢 Saludable |
| `src/services/core/ApiDispatcher.ts` | 9 | 45% | 🟢 Saludable |
| `src/utils/customer/domain.ts` | 8 | 40% | 🟢 Saludable |
| `src/services/core/http/HttpClient.ts` | 8 | 40% | 🟢 Saludable |
| `src/config/auth/bootstrap.ts` | 8 | 40% | 🟢 Saludable |
| `src/utils/renderer/ModuleUtils.ts` | 7 | 35% | 🟢 Saludable |
| `src/utils/renderer/ModelUtils.ts` | 7 | 35% | 🟢 Saludable |
| `src/utils/network/api.ts` | 7 | 35% | 🟢 Saludable |
| `src/utils/hojas/LoginHojaUtils.ts` | 7 | 35% | 🟢 Saludable |
| `src/services/core/SemanticDictionary.ts` | 7 | 35% | 🟢 Saludable |
| `src/views/DynamicModuleView.vue` | 6 | 30% | 🟢 Saludable |
| `src/services/notifications/NotificationPersistenceService.ts` | 5 | 25% | 🟢 Saludable |
| `src/services/customer/CustomerService.ts` | 5 | 25% | 🟢 Saludable |
| `src/components/organisms/TaskKanbanNative.vue` | 5 | 25% | 🟢 Saludable |
| `src/App.vue` | 5 | 25% | 🟢 Saludable |
| `src/utils/renderer/FormUtils.ts` | 4 | 20% | 🟢 Saludable |
| `src/utils/dynamic-module/hydration.ts` | 4 | 20% | 🟢 Saludable |
| `src/services/session/SessionRegistryService.ts` | 4 | 20% | 🟢 Saludable |
| `src/services/auth/AuthService.ts` | 4 | 20% | 🟢 Saludable |
| `src/router/routing.ts` | 4 | 20% | 🟢 Saludable |
| `src/lib/components/DynamicRenderer.vue` | 4 | 20% | 🟢 Saludable |
| `src/components/pages/ReauthModalHoja.vue` | 4 | 20% | 🟢 Saludable |
| `src/components/atoms/table/TableProducts.vue` | 4 | 20% | 🟢 Saludable |
| `src/components/atoms/table/TableNative.vue` | 4 | 20% | 🟢 Saludable |
| `src/components/atoms/selection/MultipleSelectOptions.vue` | 4 | 20% | 🟢 Saludable |
| `src/utils/security/jwt.ts` | 3 | 15% | 🟢 Saludable |
| `src/utils/dynamic-module/config.ts` | 3 | 15% | 🟢 Saludable |
| `src/services/core/messages.ts` | 3 | 15% | 🟢 Saludable |
| `src/composables/useSidebar.ts` | 3 | 15% | 🟢 Saludable |
| `src/components/molecules/navigation/ToolbarNative.vue` | 3 | 15% | 🟢 Saludable |
| `src/components/atoms/selection/CheckboxNative.vue" | 3 | 15% | 🟢 Saludable |
| `src/utils/renderer/RouteUtils.ts` | 2 | 10% | 🟢 Saludable |
| `src/utils/module/orchestration.ts` | 2 | 10% | 🟢 Saludable |
| `src/utils/module/index.ts" | 2 | 10% | 🟢 Saludable |
| `src/utils/customer/logo.ts` | 2 | 10% | 🟢 Saludable |
| `src/stores/auth/index.ts` | 2 | 10% | 🟢 Saludable |
| `src/persistence/auth/session.persistence.ts` | 2 | 10% | 🟢 Saludable |
| `src/lib/components/core/ServiceLocator.ts` | 2 | 10% | 🟢 Saludable |
| `src/components/pages/LoginHoja.vue` | 2 | 10% | 🟢 Saludable |
| `src/components/atoms/table/InvoiceListNative.vue` | 2 | 10% | 🟢 Saludable |
| `src/components/atoms/selection/SwitchNative.vue` | 2 | 10% | 🟢 Saludable |
| `src/views/NotFoundView.vue` | 1 | 5% | 🟢 Saludable |
| `src/utils/renderer/StyleUtils.ts` | 1 | 5% | 🟢 Saludable |
| `src/utils/dynamic-module/path.ts` | 1 | 5% | 🟢 Saludable |
| `src/stores/notifications/index.ts` | 1 | 5% | 🟢 Saludable |
| `src/router/index.ts` | 1 | 5% | 🟢 Saludable |
| `src/model/auth/login-texts.dto.ts` | 1 | 5% | 🟢 Saludable |
| `src/model/auth/css/auth.css.dto.ts` | 1 | 5% | 🟢 Saludable |
| `src/components/organisms/header/UserMenu.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/organisms/AppHeader.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/molecules/module/NestedModuleNative.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/atoms/special/NotificationBell.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/atoms/special/InvoiceNative.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/atoms/special/EmptyModuleState.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/atoms/selection/RadioNative.vue` | 1 | 5% | 🟢 Saludable |
| `src/components/atoms/file/FileInputNative.vue` | 1 | 5% | 🟢 Saludable |

---

## ⚙️ Análisis de Archivos Backend (Microservicios)

| Archivo | Puntos | Salud % | Estado |
| :--- | :---: | :---: | :--- |
| `ms-users/src/user/service/user/user-creation.service.ts` | 7 | 35% | 🟢 Saludable |
| `ms-notifications/src/notification/notification.service.ts` | 10 | 50% | 🟢 Saludable |
| `ms-notifications/src/notification/notification.repository.ts` | 6 | 30% | 🟢 Saludable |
| `ms-notifications/src/notification/notification.controller.ts` | 5 | 25% | 🟢 Saludable |
| `ms-users/src/user/controller/users.controller.ts` | 3 | 15% | 🟢 Saludable |
| `ms-users/src/user/service/user/user-list.service.ts` | 5 | 25% | 🟢 Saludable |
| `ms-users/src/user/commons/guards/module.guard.ts` | 1 | 5% | 🟢 Saludable |
| `ms-modules/src/module/utils/extract/user/user.extract.utils.ts` | 1 | 5% | 🟢 Saludable |
| `ms-modules/src/module/service/commons/functions/functions.executions.service.ts` | 1 | 5% | 🟢 Saludable |
| `ms-customer/src/customer/repository/customer.repository.ts` | 1 | 5% | 🟢 Saludable |

## Limpieza de Código (Deprecados)
- `frontend/src/composables/useModuleValidation.ts`
- `frontend/src/model/module/create-assignation.dto.ts`
