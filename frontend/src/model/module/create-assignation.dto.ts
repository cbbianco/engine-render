export interface Validation {
  message: string
  rule: string
  pattern: string
}

export interface Endpoint {
  method: string
  uri: string
  endpoint: string
  backend?: string
}

export interface SchemaField {
  tag: 'input' | 'button' | string
  validation?: Validation
  /** El nombre del campo en el modelo de datos (payload) */
  property: string
  label: string
  type: 'nativo' | string
  column: string
  align: string
  placeholder?: string
  /** Valor inicial o placeholder para hidratación, ej. "{firstName}" */
  value?: string
  /** Si el campo debe estar deshabilitado */
  disabled?: boolean
  /** Solo para botones: indica de dónde provienen los datos (ej. "form") */
  bodySource?: string
  /** Solo para botones: configuración del servicio a consumir */
  endpoint?: Endpoint
}

export interface ModuleConfig {
  metadata: {
    orchestrationType: string
    title: string
  }
  module: string
  path: string
  method: string
  order: number
  menu: string
  icon: string | { name: string; svg: string }
}

export interface ConfigurationUi {
  config: ModuleConfig
  schema: SchemaField[]
  model: Record<string, any>
}

export interface OrchestrationDetails {
  status: string
  consult?: {
    method: string
    uri: string
    endpoint: string
    backend?: string
  }
}

export interface PathDetail {
  path: string
  method: string
  order: number
  pathActive: number
}

export interface ModuleAssignment {
  _id: string
  modulo: string
  userId: string
  instruccion: string
  configurationUi: ConfigurationUi
  orchestrationDetails: OrchestrationDetails
  createdAt: string
  updatedAt: string
  path: PathDetail[]
}
