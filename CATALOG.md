# Catálogo de Componentes Dinámicos

Guía de referencia para la configuración de componentes a través del motor de renderizado.

## 📊 Tablas (TablePremium)
Componente de alta gama para visualización de datos masivos.

- **Paginación**: Soporte nativo para `page` y `limit`.
- **Acciones**: `edit`, `delete`, `pagination-change`.
- **Estándar de API**: Espera una estructura `{ data: [], meta: { total, lastPage } }`.

## 🔽 Selectores (SelectNative)
Selector inteligente con lógica de seguridad integrada.

- **Propiedades**: `label`, `property`, `options` (Array<{id, label}>).
- **Auto-Sync**: Si el valor inicial es un Label, el componente lo mapea automáticamente al ID.
- **Fail-Safe**: Si no hay match, selecciona la primera opción y se bloquea (`disabled`).
- **Visibilidad**: Si no tiene opciones, el componente se oculta automáticamente.

## 📝 Campos de Entrada (AppInput, Textarea, Password)
Estandarización visual para consistencia de marca.

- **Estados**: Soporte para `disabled` y `readonly` con fondo `#F3F4F6` y borde de color primario dinámico.
- **Validación**: Soporte para `pattern` y `message` personalizado por JSON.

## 💬 Comentarios y Tagueo (CommentModal)
Sistema interactivo para anotaciones y menciones.

- **Menciones**: Soporte nativo para `@username` con autocompletado global.
- **Persistencia**: Los comentarios se guardan en el historial y activan un "Checkmark" visual en la fila correspondiente de la tabla.
- **Detalle**: El modal recupera automáticamente el último comentario guardado por el usuario para permitir su edición.

## ⚙️ Orquestación (Service Locator)
El "Cerebro" que une todo.

- **Edit Mode**: Intercepta acciones de edición para lanzar submódulos virtuales basados en metadatos de la API (`component.properties`).
- **Data Hydration**: Mapeo automático de campos simples y complejos desde la respuesta del servidor.
