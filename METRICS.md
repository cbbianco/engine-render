# Reporte de Salud y Métricas Frontend - Engine-Render

Este reporte detalla la salud técnica de **todos** los archivos del frontend basándose en puntos de decisión (complejidad ciclomática proxy). 

## Escala de Salud
- **0% - 50%**: 🟢 **Saludable** (Mantenible y modular).
- **51% - 100%**: 🟡 **Necesita Mejora** (Candidato a revisión).
- **> 100%**: 🔴 **Candidato a Refactorización** (Complejidad crítica).

## Análisis de Archivos (v1.12.0 - Full Audit)

| Archivo | Puntos | Salud % | Estado |
| :--- | :---: | :---: | :--- |
| `src/composables/renderer/useRendererOrchestrator.ts` | 52 | 260% | 🔴 Refactorizar |
| `src/components/atoms/special/DrawOwner.vue` | 37 | 185% | 🔴 Refactorizar |
| `src/services/renderer/RendererService.ts` | 29 | 145% | 🔴 Refactorizar |
| `src/components/atoms/table/TablePremium.vue` | 27 | 135% | 🔴 Refactorizar |
| `src/components/organisms/AppSidebar.vue` | 19 | 95% | 🟡 Necesita Mejora |
| `src/views/EditModuleView.vue` | 15 | 75% | 🟡 Necesita Mejora |
| `src/utils/renderer/ClickUtils.ts` | 12 | 60% | 🟡 Necesita Mejora |
| `src/utils/renderer/DynamicRenderer.utils.ts` | 10 | 50% | 🟢 Saludable |
| `src/utils/security/encryption.ts` | 10 | 50% | 🟢 Saludable |
| `src/components/atoms/selection/SelectNative.vue` | 11 | 55% | 🟡 Necesita Mejora |
| `src/lib/components/core/ChainHandler.ts` | 11 | 55% | 🟡 Necesita Mejora |
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
| `src/components/atoms/selection/CheckboxNative.vue` | 3 | 15% | 🟢 Saludable |
| `src/utils/module/orchestration.ts` | 2 | 10% | 🟢 Saludable |
| `src/utils/module/index.ts` | 2 | 10% | 🟢 Saludable |
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
| `src/vite-env.d.ts` | 0 | 0% | 🟢 Saludable |
| `src/views/DashboardView.vue` | 0 | 0% | 🟢 Saludable |
| `src/utils/renderer/RouteUtils.ts` | 0 | 0% | 🟢 Saludable |
| `src/utils/constants/commons.ts` | 0 | 0% | 🟢 Saludable |
| `src/utils/common/constants.ts` | 0 | 0% | 🟢 Saludable |
| `src/services/customer/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/services/core/ModuleService.ts` | 0 | 0% | 🟢 Saludable |
| `src/services/core/http/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/services/auth/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/persistence/theme/theme.persistence.ts` | 0 | 0% | 🟢 Saludable |
| `src/persistence/keys.ts` | 0 | 0% | 🟢 Saludable |
| `src/persistence/customer/customer.persistence.ts` | 0 | 0% | 🟢 Saludable |
| `src/model/auth/customer/customer.response.dto.ts` | 0 | 0% | 🟢 Saludable |
| `src/model/auth/customer/customer-login-texts.dto.ts` | 0 | 0% | 🟢 Saludable |
| `src/model/auth/auth-api.response.dto.ts` | 0 | 0% | 🟢 Saludable |
| `src/main.ts` | 0 | 0% | 🟢 Saludable |
| `src/lib/types/module/schema.ts` | 0 | 0% | 🟢 Saludable |
| `src/lib/types/module/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/lib/types/module/config.ts` | 0 | 0% | 🟢 Saludable |
| `src/lib/types/module/api.ts` | 0 | 0% | 🟢 Saludable |
| `src/lib/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/icons/UserCircleIcon.vue` | 0 | 0% | 🟢 Saludable |
| `src/icons/LogoutIcon.vue` | 0 | 0% | 🟢 Saludable |
| `src/icons/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/icons/HorizontalDots.vue` | 0 | 0% | 🟢 Saludable |
| `src/icons/GridIcon.vue` | 0 | 0% | 🟢 Saludable |
| `src/icons/ChevronDownIcon.vue` | 0 | 0% | 🟢 Saludable |
| `src/config/module/setup.ts` | 0 | 0% | 🟢 Saludable |
| `src/components/pages/UnauthorizedHoja.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/pages/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/SidebarProvider.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/NavigationMenu.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/header/HeaderLogo.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/Backdrop.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/organisms/AdminLayout.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/special/ToastNotification.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/special/DefaultFallback.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/special/ConfigErrorModal.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/special/AppModalError.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/UrlNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/TextareaNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/PhoneNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/PasswordInputNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/InputPlaceholderNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/InputNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/EmailInputNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/input/AppInput.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/index.ts` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/file/FileDefaultNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/TitleNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/SeparatorNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/IconLogoFallback.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/HrNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/EstimatedRevenueNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/BreadcrumbsNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/AppTitle.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/AppText.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/AppLabel.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/display/AppFieldError.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/datetime/DatepickerNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/button/ButtonNative.vue` | 0 | 0% | 🟢 Saludable |
| `src/components/atoms/button/AppButton.vue` | 0 | 0% | 🟢 Saludable |

## Limpieza de Código (Deprecados)
Se han eliminado los siguientes archivos por falta de uso (Código Muerto):
- `src/composables/useModuleValidation.ts`
- `src/model/module/create-assignation.dto.ts`

## Plan de Mejora Continua
1. **useRendererOrchestrator**: Mover el manejo de resultados de API (`handleApiResult`) a un servicio dedicado.
2. **TablePremium**: Descomponer el renderizado de celdas en sub-componentes especializados.
