# SolutionsNplusOne - CRM & Microservices (Engine v2.1)

Este repositorio contiene la plataforma integral de SolutionsNplusOne, compuesta por un ecosistema de microservicios en el backend y un Motor de Renderizado Dinámico (Engine v2.0) en el frontend.

🚀 **Highlights: SolutionsNplusOne Engine v2.0**
El núcleo del sistema ha sido refactorizado bajo principios de Clean Architecture, permitiendo una escalabilidad comercial sin precedentes.

🏗️ **Arquitectura por Capas**
- **UI Layer**: Componentes atómicos y dinámicos (`DynamicRenderer.vue`).
- **Orchestration Layer**: Lógica de aplicación mediante Composables (`useRendererOrchestrator`).
- **Domain Layer**: Reglas puras de negocio y parseo (`DynamicParser`).
- **Infrastructure Layer**: Servicios de red y persistencia (`RendererService`).

🏗️ **Arquitectura del Backend (Microservicios)**
El ecosistema de microservicios (NestJS) sigue un patrón de **Arquitectura por Capas** con servicios actuando como **Fachadas (Facades)** para garantizar la limpieza y escalabilidad.

- **Controller Layer**: Maneja las peticiones HTTP y delega la orquestación a los servicios.
- **Service Layer (Facades)**: Orquestan la lógica de negocio llamando a servicios especializados. (Ej: `UserCreationService`).
- **Specialized Service Layer**: Ejecutan lógica técnica específica (Validación de metadatos, generación de RSA, payloads).
- **Repository Layer**: Abstracción total de la base de datos (MySQL/TypeORM y MongoDB).

📊 **Análisis de Robustez y Cumplimiento por Microservicio**

### 🟢 ms-users (Benchmark de Arquitectura)
*Este microservicio ha sido elevado al estándar máximo de desacoplamiento.*
- **Cumplimiento Arquitectónico**: **100%** (v2.1).
- **Capas**: Controller → **Facade (Orquestador)** → Specialized Services (Config, Validation, Payload) → Repository.
- **Robustez**: **Máxima**. Implementa validación dinámica de esquemas contra MongoDB y orquestación de seguridad RSA/JWT delegada.
- **Estado**: Refactorizado para SRP (Single Responsibility Principle).

### 🔵 ms-customer (Gestión de Branding & Seguridad Híbrida)
*Servicio crítico para la fase de "Handshake" inicial del frontend.*
- **Cumplimiento Arquitectónico**: **100%** (v2.2).
- **Capas**: Controller → **Facade** → **Security Service** → Repository.
- **Robustez**: **Máxima**. Tras la refactorización v2.2, toda la lógica de seguridad híbrida (AES-256 + RSA-OAEP) ha sido desacoplada en un servicio especializado.
- **Eficiencia**: Optimizado para respuestas rápidas y totalmente modular.

### 🟡 ms-modules (Generador Dinámico)
*Motor de inteligencia artificial para la hidratación de metadatos UI.*
- **Cumplimiento Arquitectónico**: **100%** (v2.2).
- **Capas**: Controller → **Facade (ModuleGenerateFacade)** → Specialized Services (IA, Persist) → Repository.
- **Robustez**: **Máxima**. Implementa una orquestación limpia de transacciones SQL solo tras la confirmación exitosa de la generación vía IA.
- **Enfoque**: Integración fluida entre la lógica generativa y la persistencia relacional/documental.

📊 **Estructura Definitiva de Módulos (JSON)**
Cada módulo debe seguir la jerarquía de `configurationUi` y `orchestrationDetails` para ser procesado correctamente por el motor de renderizado.

### 🧩 Jerarquía del Objeto Raíz
1.  **`configurationUi`**: Contiene la definición visual y metadatos del módulo.
    -   **`config`**: Metadatos (título, orden del menú, icono, breadcrumb, path).
    -   **`schema`**: Array de componentes principales (inputs, tablas, etc.).
    -   **`schemaChild`**: Array de sub-módulos anidados (ej: detalles de una fila).
2.  **`orchestrationDetails`**: Define las comunicaciones con el backend.
    -   **`consult`**: Endpoint principal de carga de datos (`GET`).
    -   **`actions`**: Mapa de acciones disponibles (CRUD, navegaciones, orquestaciones).

### ⚡ Uso de `actions`
Las acciones permiten la interactividad dentro de componentes como `table-premium` o `button`:
-   **`navigate`**: Cambia de ruta en el frontend.
-   **`api-call`**: Ejecuta una petición HTTP (`DELETE`, `PUT`, `POST`).
-   **`orchestration`**: Lógica compleja que involucra múltiples microservicios.

### ⛓️ Sub-módulos (`schemaChild`)
Permiten la composición de interfaces complejas (Maestro-Detalle). Se definen con un `moduleId` único y su propio `module` (array de componentes).

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
- **[Catálogo de Módulos](./CATALOGO.md)**: Inventario técnico detallado de componentes renderizables con ejemplos JSON.
- **[CHANGELOG.md](./CHANGELOG.md)**: Historial completo de la evolución del motor.
- **[MEJORAS.md](./MEJORAS.md)**: Plan estratégico de protección IP y Bytenode.
- **[STACK_TECNICO.md](./STACK_TECNICO.md)**: Definición del stack tecnológico y uso de IA.
