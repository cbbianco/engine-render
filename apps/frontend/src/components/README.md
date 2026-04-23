# Estructura de componentes: Átomos y Hojas

Convención para mantener una estructura clara y evitar conflictos entre desarrolladores.

## Átomos (`atoms/`)

Componentes mínimos y reutilizables. No dependen de negocio ni de rutas.

- **AppTitle**: Título (h1/h2/h3). Usa `--primary-color`.
- **AppText**: Párrafo o texto con variante `primary` | `secondary` | `error`. Respeta theme (primary, secondary, errorColor).
- **AppLabel**: Etiqueta de formulario. Color secundario.
- **AppInput**: Input controlado con `v-model`. Usa colores del theme.
- **AppButton**: Botón (type submit/button). Primario para acciones principales.
- **IconLogoFallback**: Icono 🚫 cuando no hay logo (accesibilidad: aria-hidden).

**Regla:** Los átomos solo usan variables CSS del theme (`--primary-color`, `--secondary-color`, `--error-color`, `--primary-hover`, `--bg-page`). No importan stores ni APIs.

## Hojas (`hojas/`)

Pantallas o bloques completos. Componen átomos y pueden usar stores/API.

- **LoginHoja**: Pantalla de login (logo, formulario, errores). Aplica theme del customer.
- **UnauthorizedHoja**: Pantalla "No autorizado". Aplica theme.

**Regla:** Las hojas inyectan las variables del theme (desde store) en un contenedor y usan átomos dentro. Los textos importantes = primary; el resto = secondary; errores = errorColor.

## Theme (ColorCss del servicio customer)

El theme lo provee el **servicio customer** cuando se valida el dominio (POST `/api/v1/customer`). La respuesta incluye `css: { primary, secondary, errorColor }`.

- `primary`: Acciones principales, títulos destacados.
- `secondary`: Todo el texto que no sea principal (subtítulos, labels, descripciones).
- `errorColor`: Color de error que provee el customer; se usa en borde del input en error y en mensajes de validación debajo de cada campo (small).

## Dónde colocar componentes nuevos

| Tipo | Carpeta | Ejemplo |
|------|---------|--------|
| Botón, input, texto, icono | `atoms/` | `AppCheckbox.vue` |
| Card, formulario simple, input-group | Opcional: `molecules/` (si se crea) | - |
| Pantalla completa o sección con lógica | `hojas/` | `RecoveryPasswordHoja.vue` |
| Layout (nav, footer) | `components/` raíz o `layout/` | `NavigationMenu.vue` |

## Índices

- `atoms/index.ts`: exporta todos los átomos.
- `hojas/index.ts`: exporta todas las hojas.

Importar así: `import { LoginHoja } from '@/components/pages'` o `import { AppButton } from '@/components/atoms'`.
