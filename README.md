# SolutionsNplusOne - CRM & Microservices (Engine v2.1)

Este repositorio contiene la plataforma integral de SolutionsNplusOne, compuesta por un ecosistema de microservicios en el backend y un Motor de Renderizado Dinámico (Engine v2.0) en el frontend.

🚀 **Highlights: SolutionsNplusOne Engine v2.0**
El núcleo del sistema ha sido refactorizado bajo principios de Clean Architecture, permitiendo una escalabilidad comercial sin precedentes.

🏗️ **Arquitectura por Capas**
- **UI Layer**: Componentes atómicos y dinámicos (`DynamicRenderer.vue`).
- **Orchestration Layer**: Lógica de aplicación mediante Composables (`useRendererOrchestrator`).
- **Domain Layer**: Reglas puras de negocio y parseo (`DynamicParser`).
- **Infrastructure Layer**: Servicios de red y persistencia (`RendererService`).

📈 **Crecimiento y Productividad**
La transición hacia el UI Metadata Render (v2.0) ha permitido optimizar el ciclo de vida del desarrollo:

| Métrica | v1.0 (Monolítico) | v2.0 (UI Metadata Render) | Mejora |
| :--- | :--- | :--- | :--- |
| Tiempo de Creación de Módulo | Horas | Minutos (JSON) | -80% |
| Modularidad | Baja | Alta | +150% |
| Complejidad de Código Core | >300 líneas | ~100 líneas | -66% |
| Tipos de Vista | Básicas | Grid, Kanban, Tablas Prem | +200% |

🛠️ **Estructura del Monorepo**
- **Frontend**: `apps/frontend` - CRM Dinámico con arquitectura por capas.
- **Backend**: Microservicios NestJS (`apps/ms-customer`, `apps/ms-users`, `apps/ms-modules`).

🏁 **Guía de Inicio**

### Ejecución
Para levantar todo el ecosistema (Frontend + Microservicios):
```bash
npm install
npm run dev
```

### Puertos Local (Configuración Estándar)
| Servicio | Puerto | Descripción |
| :--- | :--- | :--- |
| **Frontend** | 5173 | CRM Dinámico (Vite) |
| **ms-customer** | 4000 | Gestión de Clientes y Branding |
| **ms-users** | 4001 | Autenticación y Perfiles |
| **ms-modules** | 4002 | Generador Dinámico de Módulos (IA) |

🔒 **Estrategia de Documentación**
- **[Catálogo de Módulos](file:///home/csar/Documentos/Proyectos/Engine-Render/engine-render/CATALOGO.md)**: Inventario técnico detallado de componentes renderizables con ejemplos JSON.
- **CHANGELOG.md**: Historial completo de la evolución del motor.
- **MEJORAS.md**: Plan estratégico de protección IP y Bytenode.
- **STACK_TECNICO.md**: Definición del stack tecnológico y uso de IA.
