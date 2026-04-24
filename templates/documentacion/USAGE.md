# Guía de Uso del Engine de Metadatos

Esta documentación describe cómo construir y consumir módulos dinámicos en el ecosistema Engine-Render.

## 1. Conceptos Fundamentales
El motor se basa en la interpretación de un esquema JSON que define tanto la interfaz visual (`configurationUi`) como la lógica de comunicación (`orchestrationDetails`).

### Jerarquía JSON
```json
{
  "configurationUi": {
    "config": { ...metadatos },
    "schema": [ ...componentes ],
    "schemaChild": [ ...submodulos ]
  },
  "orchestrationDetails": {
    "consult": { ...api_carga },
    "actions": { ...operaciones }
  }
}
```

## 2. Configuración de Componentes
Cada componente en el array `schema` requiere un `type` que coincida con el `ServiceLocator` del frontend.

### Componentes Comunes
- `input`, `select`, `datepicker`: Elementos de formulario.
- `table-premium`: Grilla avanzada con soporte de acciones.
- `kanban-board`: Tablero de gestión visual.

## 3. Navegación y Rutas
El campo `path` en `config` determina la ruta virtual del módulo. El campo `order` define la posición en el menú lateral.
