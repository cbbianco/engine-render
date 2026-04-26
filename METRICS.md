# Reporte de Salud y Métricas Frontend - Engine-Render

Este reporte detalla la salud técnica de cada archivo del frontend basándose en puntos de decisión (complejidad ciclomática proxy). 

## Escala de Salud
- **0% - 50%**: 🟢 **Saludable** (Mantenible y modular).
- **51% - 100%**: 🟡 **Necesita Mejora** (Candidato a revisión).
- **> 100%**: 🔴 **Candidato a Refactorización** (Complejidad crítica).

## Análisis de Archivos (v1.12.0)

| Archivo | Puntos | Salud % | Estado |
| :--- | :---: | :---: | :--- |
| `src/composables/renderer/useRendererOrchestrator.ts` | 52 | **260%** | 🔴 Refactorizar (Corazón del sistema) |
| `src/components/atoms/special/DrawOwner.vue` | 37 | **185%** | 🔴 Refactorizar (Lógica pesada de dibujo) |
| `src/services/renderer/RendererService.ts` | 29 | **145%** | 🔴 Refactorizar (Gestión de API masiva) |
| `src/components/atoms/table/TablePremium.vue` | 27 | **135%** | 🔴 Refactorizar (Renderizado de tablas) |
| `src/components/organisms/AppSidebar.vue` | 19 | **95%** | 🟡 Necesita Mejora |
| `src/views/EditModuleView.vue` | 15 | **75%** | 🟡 Necesita Mejora |
| `src/utils/renderer/ClickUtils.ts` | 12 | **60%** | 🟡 Necesita Mejora |
| `src/utils/renderer/DynamicRenderer.utils.ts` | 10 | **50%** | 🟢 Saludable |
| `src/utils/security/encryption.ts` | 10 | **50%** | 🟢 Saludable |
| `src/utils/renderer/ValidationUtils.ts` | 9 | **45%** | 🟢 Saludable |
| `src/services/core/ApiDispatcher.ts` | 9 | **45%** | 🟢 Saludable |
| `src/services/core/http/HttpClient.ts` | 8 | **40%** | 🟢 Saludable |
| `src/utils/hojas/LoginHojaUtils.ts` | 7 | **35%** | 🟢 Saludable |
| `src/utils/renderer/ModelUtils.ts` | 7 | **35%** | 🟢 Saludable |
| `src/utils/renderer/ModuleUtils.ts` | 7 | **35%** | 🟢 Saludable |
| `src/utils/network/api.ts` | 7 | **35%** | 🟢 Saludable |
| `src/views/DynamicModuleView.vue` | 6 | **30%** | 🟢 Saludable |
| `src/lib/components/DynamicRenderer.vue` | 4 | **20%** | 🟢 Saludable |
| `src/utils/renderer/FormUtils.ts` | 4 | **20%** | 🟢 Saludable |
| `src/utils/renderer/StyleUtils.ts` | 1 | **5%** | 🟢 Saludable |
| `src/lib/components/core/ServiceLocator.ts` | 2 | **10%** | 🟢 Saludable |

## Limpieza de Código (Deprecados)
Se han eliminado los siguientes archivos por falta de uso (Código Muerto):
- `src/composables/useModuleValidation.ts` (Reemplazado por ValidationUtils)
- `src/model/module/create-assignation.dto.ts` (Sin uso)

## Plan de Mejora Continua
1. **useRendererOrchestrator**: Mover el manejo de resultados de API (`handleApiResult`) a un servicio dedicado.
2. **TablePremium**: Descomponer el renderizado de celdas en sub-componentes especializados.
3. **RendererService**: Dividir en micro-servicios por área de responsabilidad.
