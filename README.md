# Dynamic CRM Engine Render

Este repositorio contiene la arquitectura completa de un motor de renderizado dinámico para CRM, consolidando el Frontend (Vue 3) y el Backend (NestJS Microservices).

## 🚀 Arquitectura

El sistema se basa en un paradigma **Metadata-Driven UI**, donde el backend dicta la interfaz de usuario en tiempo real.

- **Frontend**: Vue 3 + Vite + Tailwind CSS. Motor de renderizado modular con Service Locator.
- **Backend**: Microservicios con NestJS (Users, Modules, Customer).

## 🛠 Características Principales

1. **Service Locator Dinámico**: Capacidad de instanciar componentes en tiempo de ejecución basados en esquemas JSON.
2. **Paginación Global**: Soporte estandarizado para `page` y `limit` en todos los listados dinámicos.
3. **Metadata-Driven Edit**: Generación automática de formularios de edición desde metadatos retornados por la API.
4. **Auto-Sync Selects**: Selectores inteligentes que se auto-corrigen y bloquean ante inconsistencias de datos.
5. **Branding Dinámico**: Personalización completa de colores y logos desde la base de datos.

## 📁 Estructura del Proyecto

```
/
├── frontend/        # Aplicación Vue 3 (CRM Premium)
├── backend/         # Ecosistema de Microservicios NestJS
└── CATALOG.md       # Catálogo técnico de componentes disponibles
```

## 🏁 Inicio Rápido

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run start:dev
```

---
Desarrollado por el **Solutions Team** siguiendo la metodología **AI Driven Development (AIDD)**.
