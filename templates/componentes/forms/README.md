# 📑 Componentes de Formulario

Esta carpeta contiene todos los componentes destinados a la captura de información.

## 🗂️ Índice de Componentes
| Componente | Tags de ServiceLocator | Descripción |
| :--- | :--- | :--- |
| **Text Inputs** | `input`, `text`, `email`, `password`, `textarea` | Entradas de texto básicas y multilínea. |
| **Special Inputs** | `phone`, `url`, `input_uri` | Entradas con formato específico y placeholders dinámicos. |
| **Files** | `file`, `file-input`, `upload` | Gestión de archivos y dropzones. |
| **Selection** | `select`, `checkbox`, `radio`, `switch` | Controles de opción única y múltiple. |
| **Datetime** | `datepicker`, `date` | Calendarios y selectores de fecha. |

---

## 💡 Ejemplo Rápido: Selección Avanzada
Si quieres renderizar un selector con múltiples opciones:

```json
{
  "type": "multiple-select-options",
  "label": "Intereses",
  "property": "interests",
  "options": [
    { "label": "Tecnología", "value": "tech" },
    { "label": "Finanzas", "value": "finance" }
  ]
}
```
