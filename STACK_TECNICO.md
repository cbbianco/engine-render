# Stack Tecnológico - SolutionsNplusOne

## Frontend
- **Framework**: Vue 3 (Composition API)
- **Store**: Pinia
- **Router**: Vue Router 4
- **Bundler**: Vite 5+
- **Styling**: Vanilla CSS + TailAdmin (Tailwind-like structure)
- **Components**: UI Metadata Render Engine (v2.2)
- **Language**: TypeScript
- **Patterns**: Event-Driven Programming (EDP) with mitt.

## Backend
- **Framework**: NestJS (v11)
- **Microservicios**:
  - `ms-customer`: Branding y configuración de cliente.
  - `ms-users`: Autenticación, JWT y perfiles.
  - `ms-modules`: Generación de módulos y lógica de IA.
  - `ms-notifications`: Persistencia histórica y limpieza de notificaciones.
- **Database**: PostgreSQL (MySQL Compatible) / MongoDB (Metadata & Notifications)
- **Language**: TypeScript

## Infraestructura & DevOps
- **Monorepo Management**: NPM Workspaces
- **Concurrencia**: Concurrently (Scripts unificados)
- **Environment**: Dotenv (Carga jerárquica)
- **Cleanup**: Auto-port cleanup scripts for zero-conflict development.
