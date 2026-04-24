# Guía de Acciones y Orquestación

Las acciones definen la interactividad del sistema y cómo se comunican los microservicios.

## 1. Tipos de Acciones

### ⚡ Navigate
Cambia la vista del usuario a otro módulo o ruta.
```json
{
  "type": "navigate",
  "moduleId": "register-user",
  "path": "/create-user",
  "params": { "id": "{id}" }
}
```

### 🌐 API Call
Ejecuta una petición HTTP directa a un microservicio.
```json
{
  "type": "api-call",
  "method": "DELETE",
  "endpoint": "/api/v1/user/{id}"
}
```

### 🧠 Orchestration
Lógica compleja que puede involucrar validaciones previas o llamadas a múltiples servicios.
```json
{
  "type": "orchestration",
  "target": "ms-users",
  "endpoint": "/api/v1/sync"
}
```

## 2. Parámetros Dinámicos
Puedes usar llaves `{}` para inyectar datos del contexto o de la fila actual (en tablas).
Ejemplo: `/api/v1/user/{id}` reemplazará `{id}` por el valor de la propiedad `id` del objeto actual.
