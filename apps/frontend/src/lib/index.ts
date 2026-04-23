/**
 * Motor UI paramétrico: renderizado dinámico desde configuration_ui del módulo.
 */

export { getComponentForSchema } from './components/core/ChainHandler'
export { ServiceLocator } from './components/core/ServiceLocator'
export { ApiDispatcher } from '@/services/core/ApiDispatcher'
export { expandOptions, isSemanticPattern, extractTheme } from '@/services/core/SemanticDictionary'
export type { ConfigurationUi, SchemaField, SchemaFieldNativo, ModuleConfigResponse } from './types/module'
