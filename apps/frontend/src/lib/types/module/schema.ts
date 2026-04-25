/** 
 * Tipos para la definición de esquemas del motor UI paramétrico.
 */

export interface SchemaFieldValidation {
  rule?: string
  pattern?: string
  message?: string
}

/** Config del draw: origen de datos (multiple-select-options) y maqueta de la grilla. */
export interface DrawConfig {
  /** Grid de la grilla de preview (ej. col-3). */
  grid?: string
  /** Si mostrar vista previa de los componentes seleccionados. */
  preview?: boolean
  /** Nombre del campo (property) que tiene la selección, ej. "multiple-select-options". */
  dataSource?: string
  /** Cantidad de columnas fijas para la grilla (ej. 3 o 4). */
  columns?: number | string
}

/** Campo de schema: nativo (input, select, button) o draw. */
export interface SchemaFieldBase {
  label: string
  property: string
  type: string
  /** Clases de columna (ej. col-12, col-6). Por defecto col-12. */
  column?: string
  /** Alineación Flexbox: start, center, end, stretch, baseline. */
  align?: string
  /** Validación: regex y mensaje. */
  validation?: SchemaFieldValidation
  /** Opciones para select/draw (o patrón <<TEMA>>). Original: 'options'. */
  options?: string[]
  /** Alias de opciones compatible con algunos endpoints del backend. */
  values?: string[]
  /** Valor inicial o placeholder para hidratación, ej. "{firstName}" */
  value?: string
  /** Si el campo debe estar visible (por defecto true si no existe). */
  visible?: boolean
  /** Si el campo debe estar deshabilitado */
  disabled?: boolean
  /** Si el campo es solo lectura */
  readonly?: boolean
}

export interface SchemaFieldDraw extends SchemaFieldBase {
  type: 'owner' | 'draw'
  /** Configuración del draw: dataSource = campo multiple-select cuyos valores se muestran como preview. */
  config?: DrawConfig
}

export interface SchemaFieldNativo extends SchemaFieldBase {
  /** Placeholder para inputs. */
  placeholder?: string
  /** Opciones para select: array de strings o patrón <<TEMA>>. */
  options?: string[]
  /** Campo del model con el que debe coincidir el valor (ej: confirmar password). */
  match?: string
  /** Acción para botones: endpoint (URI con tokens {input_uri}, etc.), method, body/bodySource. */
  endpoint?: string | { uri?: string; method?: string; backend?: string; endpoint?: string; tag?: string }
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** Campo del model que define el método HTTP (ej: "select-input"). */
  methodSource?: string
  body?: string
  /** Campo del model con el payload JSON (ej: input_body). */
  bodySource?: string
}

export type SchemaField = SchemaFieldNativo | SchemaFieldDraw
