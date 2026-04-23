/** 
 * Tipos para la configuración y metadatos de los módulos.
 */

export interface ModuleUiMetadata {
  orchestrationType?: string
  /** Título del módulo (ej. "Crear Usuario"). */
  title?: string
  /** Nombre lógico del módulo, usado para correlacionar con el path (ej. "profile", "module"). */
  module?: string
  order?: number
}

export interface ModuleUiEndpoint {
  uri?: string
  method?: string
  endpoint: string
  backend?: string
  bodySource?: string
}

export interface ModuleUiConfig {
  /** Metadatos del módulo (título, orden, tipo de orquestación). */
  metadata?: ModuleUiMetadata
  /** Endpoint por defecto asociado al módulo (no al botón individual). */
  endpoint?: ModuleUiEndpoint
  /**
   * Definición del menú donde se inyecta este módulo.
   * Ejemplos:
   * - "menu:Modulo" -> menú padre "Modulo"
   * - "menu-item:Usuarios:Crear" -> menú padre "Usuarios", hijo "Crear".
   */
  menu?: string
  /** Nombre lógico del módulo (puede venir aquí además de en metadata.module). */
  module?: string
  /** Path asociado al módulo (ej. "/module", "/profile"). */
  path?: string
  /** Dominio al que pertenece este módulo (ej. "dominio1.com"). */
  domain?: string
  /**
   * Fuente de datos para prellenar el model del formulario.
   * Ej: "token" -> datos obtenidos del payload del access_token.
   */
  dataSource?: string
  /** Icono del módulo (nombre o objeto con SVG) */
  icon?: string | { name: string; svg: string }
  /** Breadcrumbs to display at the top of the module */
  breadcrumb?: { label: string; path?: string }[]
  /** Toolbar actions to display at the top right of the module */
  toolbar?: {
    label: string
    action: string
    icon?: string
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
  /** Action definitions indexed by their action key */
  actions?: Record<string, any>
}

/** Definición de acción en botón: endpoint y cuerpo paramétrico. */
export interface ActionConfig {
  /** URI con tokens {tag} reemplazables por valores del model. */
  endpoint?: string
  /** Método: GET, POST, PUT, DELETE, PATCH. */
  method?: string
  /** Nombre del campo cuyo valor (JSON string) se envía como body. */
  body?: string
}
