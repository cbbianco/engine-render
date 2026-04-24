# Guía de Sub-módulos (schemaChild)

El motor permite anidar módulos dentro de otros para crear interfaces de tipo Maestro-Detalle.

## 1. Definición de schemaChild
Se define dentro del objeto `configurationUi`.

```json
"schemaChild": [
  {
    "moduleId": "item-details",
    "path": "/details",
    "config": { "title": "Detalle del Item" },
    "module": [
      { "type": "table", "label": "Sub-lista", "property": "sub_items" }
    ]
  }
]
```

## 2. Activación
Los sub-módulos se activan generalmente mediante acciones de navegación interna o eventos de expansión en tablas.

## 3. Flujo de Datos
El sub-módulo hereda el contexto del padre, lo que permite realizar consultas filtradas automáticamente si se configuran los parámetros dinámicos en `orchestrationDetails`.
