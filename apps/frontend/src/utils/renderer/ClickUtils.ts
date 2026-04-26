import { DynamicParser } from './DynamicRenderer.utils'
import { ValidationUtils } from './ValidationUtils'

/**
 * Interfaz para el contexto necesario en los manejadores de clic.
 */
export interface ClickContext {
  model: Record<string, any>
  submoduleModel: Record<string, any>
  schema: any
  activeSubmodule: any
  validationErrors: Record<string, any>
  isSubmitting: { value: boolean }
  wasSubmitted: { value: boolean }
  feedback: { value: any }
  route: any
  props: any
  // Callbacks para efectos secundarios
  backToMain: () => void
  fetchConsultData: (params?: any) => void
  executeApiCall: (item: any, payload: any) => Promise<any>
  handleApiResult: (result: any, item: any) => void
  handleComponentAction: (e: any, item: any, childContext?: any) => void
  notificationStore: any
  // Sistema de Confirmación
  confirmAction: (item: any, onConfirm: () => void) => void
}

/**
 * Clase utilitaria para centralizar el manejo de eventos de clic y acciones de componentes.
 */
export class ClickUtils {
  
  /**
   * Maneja el clic en un breadcrumb.
   */
  static handleBreadcrumbClick(item: any, context: ClickContext) {
    if (item.path === context.route.path && context.activeSubmodule.value) {
      context.backToMain()
    }
  }

  /**
   * Maneja el clic en botones (Toolbar o Componentes).
   */
  static async handleButtonClick(item: any, context: ClickContext, childContext?: any) {
    // 0. Verificación de Confirmación
    if (item.confirm === true || item.config?.confirm === true) {
      context.confirmAction(item, () => this.executeValidatedAction(item, context, childContext))
      return
    }

    await this.executeValidatedAction(item, context, childContext)
  }

  /**
   * Ejecuta la acción después de pasar (o no requerir) confirmación.
   */
  private static async executeValidatedAction(item: any, context: ClickContext, childContext?: any) {
    // 1. Caso Especial: submit-master
    if (item.action === 'submit-master') {
      await this.handleSubmitMaster(item, context)
      return
    }

    // 2. Caso Especial: Acciones personalizadas (que NO sean submit estándar)
    const customAction = item.action
    if (customAction && customAction !== 'submit-master' && customAction !== 'submit') {
      context.handleComponentAction({ type: customAction, payload: context.model }, item, childContext)
      return
    }

    // 3. Caso General: Submit de formulario (Padre o Hijo)
    await this.handleStandardSubmit(item, context)
  }

  /**
   * Lógica interna para el envío unificado (submit-master).
   */
  private static async handleSubmitMaster(item: any, context: ClickContext) {
    context.wasSubmitted.value = true
    
    // A. Validación Global con detección de origen del error
    const parentValid = this.validateSchema(context.schema.value, context.model, context)
    let childValid = true
    if (context.activeSubmodule.value) {
      const childSchema = (context.activeSubmodule.value.module || context.activeSubmodule.value.schema || [])
      childValid = this.validateSchema(childSchema, context.submoduleModel, context)
    }

    if (!parentValid || !childValid) {
      this.handleValidationError(context)
      // REGLA: Si hay errores en el padre, regresamos a la vista principal para que el usuario los vea
      if (!parentValid && context.activeSubmodule.value) {
        console.warn('[ClickUtils] Parent validation failed during master submit. Returning to main view.')
        context.backToMain()
      }
      return
    }

    // B. Preparación de Payload Unificado
    const masterSubmit = context.schema.value.find((it: any) => DynamicParser.isButton(it) && it.endpoint)
    if (!masterSubmit) return

    const isUnified = item.config?.useMasterModel !== false
    const payload = this.buildPayload(context, isUnified, true)

    // C. Ejecución
    context.isSubmitting.value = true
    const result = await context.executeApiCall(masterSubmit, payload)
    context.handleApiResult(result, masterSubmit)
    context.isSubmitting.value = false
  }

  /**
   * Lógica interna para el envío estándar.
   */
  private static async handleStandardSubmit(item: any, context: ClickContext) {
    context.wasSubmitted.value = true
    
    // A. Validación del esquema activo
    const targetSchema = (context.activeSubmodule.value?.module || context.activeSubmodule.value?.schema || context.schema.value)
    const isUnified = item.config?.useMasterModel === true || item.useMasterModel === true
    const currentModel = (context.activeSubmodule.value && !isUnified) ? context.submoduleModel : context.model

    const isValid = this.validateSchema(targetSchema, currentModel, context)
    if (!isValid) {
      this.handleValidationError(context)
      return
    }

    // B. Preparación de Payload
    const payload = this.buildPayload(context, isUnified, false, targetSchema)

    // C. Ejecución
    context.isSubmitting.value = true
    context.feedback.value = null
    const result = await context.executeApiCall(item, payload)
    context.handleApiResult(result, item)
    context.isSubmitting.value = false
  }


  /**
   * Valida un esquema específico contra un modelo.
   */
  private static validateSchema(schema: any[], model: any, context: ClickContext): boolean {
    let allValid = true
    schema.forEach((itm: any) => {
      const prop = DynamicParser.getProp(itm)
      if (prop && !ValidationUtils.runValidation(context.validationErrors, model, prop, model[prop], itm)) {
        allValid = false
      }
    });
    return allValid
  }

  /**
   * Construye el payload filtrando campos 'noSubmit' y archivos vacíos.
   */
  private static buildPayload(context: ClickContext, isUnified: boolean, isMaster: boolean, specificSchema?: any[]): any {
    const payload = {} as any
    const rawModel = (context.activeSubmodule.value && !isUnified) ? context.submoduleModel : context.model

    const processField = (f: any, m: any) => {
      const prop = DynamicParser.getProp(f)
      const val = m[prop]
      const isFileEmpty = f.type === 'file' && (
        val === null || val === '' || 
        (typeof val === 'object' && !(val instanceof File || val instanceof Blob) && Object.keys(val as any).length === 0)
      )
      if (prop && f.noSubmit === false && val !== undefined && val !== null && !isFileEmpty) {
        payload[prop] = val
      }
    }

    if (isMaster) {
      context.schema.value.forEach((f: any) => processField(f, context.model))
      if (context.activeSubmodule.value && isUnified) {
        const childFields = (context.activeSubmodule.value.module || context.activeSubmodule.value.schema || [])
        childFields.forEach((f: any) => processField(f, context.submoduleModel))
      }
    } else {
      const schema = specificSchema || []
      schema.forEach((f: any) => processField(f, rawModel))
    }

    return payload
  }

  /**
   * Maneja el estado de error de validación.
   */
  private static handleValidationError(context: ClickContext) {
    context.feedback.value = { type: 'error', message: 'Por favor, corrija los errores en el formulario' }
    context.notificationStore.addNotification('error', 'Error de Validación', 'Existen campos con errores o vacíos')
  }
}
