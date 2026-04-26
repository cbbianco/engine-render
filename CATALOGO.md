# Catálogo de Componentes Renderizables - Engine v2.2

## 7. Componentes de Sistema (Globales)

### **Notification Bell (Campana)**
- **Descripción**: Centro de notificaciones integrado en el header con historial y contador de mensajes no leídos.
- **Iconografía**: SVG Nativo (Alta compatibilidad).

### **Toast Notification (Alertas Push)**
- **Descripción**: Sistema de alertas emergentes con soporte para estados `success`, `error` e `info`.
- **Configuración**: Tiempo de vida (TTL) configurable mediante variables de entorno (`VITE_NOTIFICATION_TTL_MINUTES`).

Este documento detalla todos los componentes disponibles para ser renderizados dinámicamente mediante el **UI Metadata Render Engine** de SolutionsNplusOne.

Cada componente se activa mediante la propiedad `type` en el esquema JSON enviado por el backend.

---

## 1. Entradas de Texto (Input Group)

Componentes básicos para la captura de información alfanumérica.

### **Input (Texto Básico)**
- **Tipos**: `input`, `text`, `input_text`
- **Ejemplo**:
```json
{
  "type": "input",
  "label": "Nombre Completo",
  "property": "full_name",
  "placeholder": "Ej: Juan Pérez",
  "column": "col-6"
}
```

### **Email / Password**
- **Tipos**: `email`, `password`
- **Ejemplo**:
```json
{
  "type": "email",
  "label": "Correo Electrónico",
  "property": "user_email",
  "column": "col-6"
}
```

### **Textarea (Área de Texto)**
- **Tipos**: `textarea`, `input_body`
- **Ejemplo**:
```json
{
  "type": "textarea",
  "label": "Comentarios",
  "property": "comments",
  "column": "col-12"
}
```

---

## 2. Selección y Opciones (Selection Group)

### **Select (Desplegable)**
- **Tipos**: `select`
- **Ejemplo**:
```json
{
  "type": "select",
  "label": "País",
  "property": "country_id",
  "options": [
    { "label": "México", "value": 1 },
    { "label": "España", "value": 2 }
  ],
  "column": "col-4"
}
```

### **Switch / Checkbox / Radio**
- **Tipos**: `switch`, `checkbox`, `radio`
- **Ejemplo (Switch)**:
```json
{
  "type": "switch",
  "label": "Activo",
  "property": "is_active"
}
```

---

## 3. Tablas y Listados (Table Group)

### **Table Premium (Grilla Avanzada)**
- **Tipos**: `table-premium`, `table`, `data-table`
- **Descripción**: Soporta búsqueda, filtrado, paginación y acciones masivas.
- **Ejemplo**:
```json
{
  "type": "table-premium",
  "label": "Listado de Usuarios",
  "property": "users_list",
  "config": {
    "searchable": true,
    "actions": ["edit", "delete", "view"]
  }
}
```

### **Table Products (Listado con Imágenes)**
- **Tipos**: `table-products`, `products-list`
- **Ejemplo**:
```json
{
  "type": "table-products",
  "label": "Catálogo de Productos",
  "property": "products"
}
```

---

## 4. Vistas de Gestión (Board Group)

### **Kanban Board**
- **Tipos**: `kanban-board`, `kanban`, `task-kanban`
- **Descripción**: Vista de tarjetas arrastrables por estados.
- **Ejemplo**:
```json
{
  "type": "kanban-board",
  "label": "Gestión de Tareas",
  "property": "tasks",
  "column": "col-12"
}
```

---

## 5. Componentes de Negocio y Especiales

### **Facturación (Invoice)**
- **Tipos**: `invoice`, `single-invoice`
- **Descripción**: Renderiza un detalle de factura con diseño premium.

### **Dibujo/Firma (Draw)**
- **Tipos**: `draw`
- **Descripción**: Permite capturar firmas o dibujos a mano alzada.

### **Revenue Cards**
- **Tipos**: `estimated-revenue`
- **Descripción**: Card estadística para dashboards.

---

## 6. Estructura y Navegación

### **Title & Separators**
- **Tipos**: `title`, `hr`
- **Separador Dinámico**: Se activa con `"separator": true`.
```json
{
  "separator": true,
  "label": "Información de Contacto"
}
```

### **Datepicker**
- **Tipos**: `datepicker`, `date`
```json
{
  "type": "datepicker",
  "label": "Fecha de Nacimiento",
  "property": "birth_date"
}
```

---

## Guía de Configuración de Columnas
El motor utiliza un sistema de grid de 12 columnas.
- `col-12`: Ancho completo.
- `col-6`: Medio ancho.
- `col-4`: Un tercio.
- `col-3`: Un cuarto.

*Este catálogo se actualiza automáticamente conforme evoluciona el ServiceLocator.*
