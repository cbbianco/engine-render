# Componentes del motor UI paramétrico

## Regla: nativo = plantilla (TailAdmin)

**Todos los campos del JSON con `type === 'nativo'` se renderizan exclusivamente con componentes de la plantilla.** Referencia: [TailAdmin Form Elements](https://vue-demo.tailadmin.com/form-elements).

- **Plantilla** = átomos en `@/components/atoms/` (AppInput, AppLabel, AppButton, AppFieldError) y clases TailAdmin (`form-group form-group--plantilla`, `app-input`, `app-select`, `border-stroke`, `text-meta-1`, etc.).
- **No maquetar desde cero:** Cada componente nativo debe usar los átomos de la plantilla o las mismas clases CSS que la plantilla. No inventar diseños propios.
- El **ServiceLocator** registra por `tag` (y opcionalmente por `property`) qué componente Vue usar para cada tag nativo.
- Cada componente en `*.vue` de esta carpeta que se registra como nativo debe:
  - Usar el wrapper `form-group form-group--plantilla`.
  - Usar los átomos de la plantilla para labels, inputs, selects, botones y mensajes de error.
  - Respetar la tipografía y padding de la plantilla oficial.

Así se garantiza que todo lo que viene como "nativo" en el schema tenga la misma fidelidad visual y UX que el resto de la aplicación TailAdmin.

## Draw (componentes a renderizar)

- **DrawOwner** muestra una grilla horizontal de tarjetas (1 col móvil, 2 en tablet, 3 en desktop). Cada ítem del array del `dataSource` se muestra en una tarjeta al lado de la otra.
- Para que varias selecciones se vean **una al lado de la otra**, el campo que alimenta el draw (`config.dataSource`) debe ser un **multi-select**: en el schema ese campo debe tener `tag: "multiple-select-options"` (no `select`). Así el modelo guarda un array (ej. `["datepicker", "input", "checkbox"]`) y se renderiza una tarjeta por elemento.
- **Grilla col-3:** Cuando `config.grid === "col-3"`, el draw usa siempre 3 columnas en desktop (lg). Los componentes dentro de cada tarjeta son gestionables (editables, sin bloquear eventos).

## Mapeo tag/propperty → plantilla (form-elements)

| tag / propperty | Componente plantilla |
|-----------------|----------------------|
| `input` | Input básico (label + input texto) |
| `url` | Input URL (prefijo "http://" + placeholder www.tailadmin.com) |
| `input-with-placeholder` | Input con placeholder |
| `password-input` | Input contraseña + icono ojo |
| `select` | Select simple |
| `multiple-select-options` | Multi-select (array) |
| `checkbox`, `radio` | Checkbox / Radio plantilla |
| `switch` | Toggle encendido/apagado |
| `textarea` | Textarea |
| `datepicker` | Datepicker (icono calendario) |
| `file-upload` / `file-input` | Zona de carga (dropzone) |
| `button` | Botón plantilla |

El backend puede enviar llaves en `model` con formato `["prop"]`; el frontend las normaliza a `prop` para mantener la reactividad.
