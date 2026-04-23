import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import { DynamicParser } from '@/lib/components/core/DynamicRenderer.utils'
import { rendererService } from '@/services/renderer/RendererService'

/**
 * useRendererOrchestrator - Orquestador lógico del DynamicRenderer.
 * 
 * Este composable centraliza la lógica de negocio, el estado reactivo y la
 * orquestación de datos para el motor de renderizado dinámico.
 * 
 * @param props - Propiedades pasadas desde el componente DynamicRenderer
 * @param emit - Emisor de eventos para comunicación con el padre
 */
export function useRendererOrchestrator(props: any, emit: any) {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // --- Estado Reactivo ---
  const isSubmitting = ref(false)                      // Indica si hay un proceso de envío en curso
  const wasSubmitted = ref(false)                      // Bandera para mostrar errores de validación tras el primer intento
  const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null) // Mensajes de éxito o error
  const fieldRefs = new Map<string, unknown>()         // Referencias a los componentes de campo hijos
  const validationErrors = reactive<Record<string, { invalid: boolean; message?: string }>>({}) // Errores de validación frontend
  const backendErrors = reactive<Record<string, string>>({}) // Errores retornados por la API
  const model = reactive({}) as any                    // Modelo de datos que se sincroniza con los inputs


  // --- Estados de Navegación Interna (Submódulos) ---
  const activeSubmodule = ref<any>(null)               // Módulo hijo actualmente en "foco"
  const submoduleModel = reactive({}) as any           // Modelo de datos aislado para el submódulo
  const dynamicComponentMetadata = ref<any[] | null>(null) // Metadatos dinámicos para edición (Service Locator)

  // --- Propiedades Computadas ---

  /**
   * Procesa el esquema crudo eliminando duplicados y elementos inválidos.
   */
  const schema = computed(() => {
    let rawSchema = props.config?.schema ?? []
    
    // DEFENSA: Si por algún error de merge el schema llega como objeto, intentamos convertirlo a array
    if (rawSchema && typeof rawSchema === 'object' && !Array.isArray(rawSchema)) {
      console.warn('[Orchestrator] Schema detected as Object, attempting conversion to Array', rawSchema)
      rawSchema = Object.values(rawSchema)
    }

    if (!Array.isArray(rawSchema)) return []

    const seen = new Set<string>()
    return rawSchema.filter((item: any) => {
      if (!item) return false
      const key = `${item.type}-${DynamicParser.getProp(item)}-${item.label}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })

  /**
   * Determina si la vista actual debe tratarse como un tablero (dashboard).
   */
  const isDashboardView = computed(() => DynamicParser.isDashboard(schema.value as any))

  /**
   * Genera la lista de breadcrumbs procesada para la navegación actual.
   * Maneja el historial de navegación 'desde' (fromPath/fromLabel).
   */
  const processedBreadcrumbs = computed(() => {
    const base = props.config?.config?.breadcrumb || []
    const title = props.config?.config?.metadata?.title || props.config?.config?.module || 'Tablero'
    const items = [{ ...(base[0] || { label: 'Dashboard', path: '/dashboard' }) }]
    const fLabel = route.query.fromLabel as string
    const fPath = route.query.fromPath as string
    
    if (fLabel && fPath && fLabel.toLowerCase() !== items[0].label?.toLowerCase()) {
      items.push({ label: fLabel, path: fPath })
    }
    if (title.toLowerCase() !== items[0].label?.toLowerCase() && fLabel?.toLowerCase() !== title.toLowerCase()) {
      items.push({ label: title })
    }
    return items
  })

  /**
   * Inicializa o resetea el modelo de datos basado en la configuración del esquema.
   */
  function initModel() {
    const baseData = DynamicParser.normalizedModelFromConfig(props.config)
    // Limpieza reactiva del modelo
    Object.keys(model).forEach(key => delete model[key])
    
    // 1. Campos del schema principal
    schema.value.forEach((f: any) => {
      if (!DynamicParser.isDataField(f)) return 
      const propKey = DynamicParser.getProp(f)
      if (!propKey) return
      
      const isTable = f.type?.includes('table')
      model[propKey] = baseData[propKey] === '{res}' ? (isTable ? [] : '') : (baseData[propKey] ?? f.value ?? (isTable ? [] : ''))
    })

    // 2. Campos de schemaChild (si existen) - Búsqueda Defensiva
    const schemaChildren = props.config?.schemaChild || props.config?.configurationUi?.schemaChild || []
    schemaChildren.forEach((child: any) => {
      const childSchema = child.module || []
      childSchema.forEach((f: any) => {
        if (!DynamicParser.isDataField(f)) return
        const propKey = DynamicParser.getProp(f)
        if (!propKey || model[propKey] !== undefined) return
        model[propKey] = f.value ?? (f.type?.includes('table') ? [] : '')
      })
    })
  }

  /**
   * Limpia el formulario basándose en el estado de 'disabled'.
   * Si f.disabled === true, NO se limpia. Los demás sí.
   */
  function resetForm() {
    wasSubmitted.value = false
    Object.keys(validationErrors).forEach(k => delete validationErrors[k])
    Object.keys(backendErrors).forEach(k => delete backendErrors[k])

    schema.value.forEach((f: any) => {
      if (!DynamicParser.isDataField(f)) return 
      
      // REGLA: Si está disabled o readonly, NO se limpia el valor.
      const isDisabled = f.disabled === true || f.disabled === 'true'
      const isReadonly = f.readonly === true || f.readonly === 'true'
      
      if (isDisabled || isReadonly) return 
      
      const propKey = DynamicParser.getProp(f)
      if (propKey) {
        // Limpieza según tipo de dato
        model[propKey] = (f.type?.includes('table') || f.type?.includes('invoice')) ? [] : ''
      }
    })
  }

  /**
   * Actualiza el modelo del submódulo y sincroniza con el modelo maestro si la propiedad existe.
   */
  function updateSubmoduleModel(prop: string, val: any): void {
    submoduleModel[prop] = val
    // Sincronización: Si el campo también existe en el modelo maestro, lo actualizamos
    if (model[prop] !== undefined) {
      model[prop] = val
    }
    // Validaciones locales
    const item = (activeSubmodule.value?.module || []).find((f: any) => DynamicParser.getProp(f) === prop)
    if (item) DynamicParser.runValidation(validationErrors, model, prop, val, item)
  }

  /**
   * Cambia el contexto de visualización a un submódulo específico.
   * Carga el modelo inicial del submódulo sincronizando con el maestro.
   */
  function activateSubmodule(child: any) {
    if (!child) return
    activeSubmodule.value = child
    
    // Inicializar modelo aislado del submódulo
    Object.keys(submoduleModel).forEach(k => delete submoduleModel[k])
    const childSchema = child.module || []
    childSchema.forEach((f: any) => {
      if (!DynamicParser.isDataField(f)) return
      const propKey = DynamicParser.getProp(f)
      if (propKey) {
        // PRIORIDAD: 1. Valor actual en el modelo maestro | 2. Valor por defecto del esquema
        submoduleModel[propKey] = model[propKey] ?? f.value ?? (f.type?.includes('table') ? [] : '')
      }
    })
  }

  /**
   * Regresa a la vista del módulo maestro.
   */
  function backToMain() {
    activeSubmodule.value = null
    // NO limpiamos el submoduleModel aquí para evitar pérdida de datos reactivos durante transiciones
  }

  /**
   * Realiza la consulta de datos inicial o de refresco (para tablas, etc).
   */
  async function fetchConsultData(params?: { page?: number; limit?: number }) {
    const consultData = await rendererService.fetchConsultData(props.orchestrationDetails?.consult, model, params)
    if (!consultData) return

    // SERVICE LOCATOR: Captura de metadatos dinámicos para edición/vistas posteriores
    if (consultData.component?.properties) {
      console.log('[Orchestrator] Dynamic component metadata received from API')
      dynamicComponentMetadata.value = consultData.component.properties
    }

    // Mapeo selectivo de datos retornados al modelo
    schema.value.forEach((fld: any) => {
      const prop = DynamicParser.getProp(fld)
      if (!prop) return

      // Buscamos el valor en la respuesta (soporte para respuesta plana o envuelta en user/data)
      const getVal = (key: string) => consultData[key] ?? consultData.user?.[key] ?? consultData.data?.[key]

      // PRIORIDAD 1: Mapeo por Token {placeholder}
      if (fld.value) {
        const match = fld.value.match(/^\{([^}]*)\}$/)
        if (match) {
          const dKey = match[1] || ''
          const finalVal = (dKey === 'res' || dKey === 'root' || dKey === '') ? consultData : getVal(dKey)
          if (finalVal !== undefined) {
             updateModel(prop, finalVal)
             return // Mapeado con éxito
          }
        }
      }

      // PRIORIDAD 2: Mapeo Directo por Propiedad (Fallback)
      const directVal = getVal(prop)
      if (directVal !== undefined) {
        updateModel(prop, directVal)
      }
    })
  }

  /**
   * Actualiza un valor en el modelo binario y ejecuta validaciones inmediatas.
   */
  function updateModel(prop: string, val: any): void {
    model[prop] = val
    if (backendErrors[prop]) delete backendErrors[prop]
    const item = schema.value.find((f: any) => DynamicParser.getProp(f) === prop)
    if (item) DynamicParser.runValidation(validationErrors, model, prop, val, item)
  }

  /**
   * Manejador principal para los clics en botones del renderizador.
   * Realiza validaciones globales antes de ejecutar llamadas a API.
   */
  async function handleButtonClick(item: any, childContext?: any) {
    // SOPORTE: Acción especial para delegar el submit al padre desde un hijo
    if (item.action === 'submit-master') {
      // 1. Validaciones globales primero
      wasSubmitted.value = true
      let isFormValid = true
      const targetSchema = (activeSubmodule.value?.module || activeSubmodule.value?.schema || activeSubmodule.value?.configurationUi?.schema || schema.value)
      targetSchema.forEach((itm: any) => {
        const prop = DynamicParser.getProp(itm)
        if (prop && !DynamicParser.runValidation(validationErrors, model, prop, model[prop], itm)) {
          isFormValid = false
        }
      });
      if (!isFormValid) {
        feedback.value = { type: 'error', message: 'Por favor, corrija los errores en el formulario' }
        return
      }

      const masterSubmit = schema.value.find(it => DynamicParser.isButton(it) && it.endpoint)
      if (masterSubmit) {
        const isUnified = item.config?.useMasterModel === true || item.useMasterModel === true
        const currentModel = (activeSubmodule.value && !isUnified) ? submoduleModel : model
        
        isSubmitting.value = true
        const result = await rendererService.executeApiCall(masterSubmit, currentModel)
        handleApiResult(result, masterSubmit)
        isSubmitting.value = false
        return
      }
    }

    const customAction = item.action
    if (customAction && customAction !== 'submit-master') {
      handleComponentAction({ type: customAction, payload: model }, item, childContext)
      return
    }

    wasSubmitted.value = true
    let isFormValid = true
    
    // Validación manual de todos los campos marcados en el esquema
    schema.value.forEach((itm: any) => {
      const prop = DynamicParser.getProp(itm)
      if (prop && !DynamicParser.runValidation(validationErrors, model, prop, model[prop], itm)) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      feedback.value = { type: 'error', message: 'Por favor, corrija los errores en el formulario' }
      return
    }

    isSubmitting.value = true
    feedback.value = null

    // REGLA: Si hay un submódulo activo, usamos su modelo aislado. De lo contrario, el global.
    // EXCEPCIÓN: Si el botón tiene la bandera 'useMasterModel' en su config, usamos el modelo global (Unificación).
    const isUnified = item.config?.useMasterModel === true || item.useMasterModel === true
    const currentModel = (activeSubmodule.value && !isUnified) ? submoduleModel : model

    // Ejecución de la llamada a la API definida en el botón
    const result = await rendererService.executeApiCall(item, currentModel)
    handleApiResult(result, item)
    isSubmitting.value = false
  }

  /**
   * Procesa el resultado de una llamada a la API y actualiza el estado.
   */
  function handleApiResult(result: any, item: any) {
    if (result.success) {
      // SOPORTE: Nueva estructura unificada { data: { ... }, path: [ ... ] }
      const response = result.data || {}
      const payload = response.data || response
      const paths = response.path || payload.path || []

      const { user, access_token, message } = payload
      
      feedback.value = { type: 'success', message: message || 'Operación completada con éxito' }
      
      // 2. Hidratación Dinámica: Actualizamos el modelo con los datos del usuario o el payload directo
      const dataToMap = user || payload
      if (dataToMap && typeof dataToMap === 'object') {
        Object.keys(dataToMap).forEach(key => {
          if (key === 'password') return
          // Solo actualizamos si el campo existe en nuestro modelo actual o esquema
          if (model[key] !== undefined || schema.value.some((f: any) => DynamicParser.getProp(f) === key)) {
            updateModel(key, dataToMap[key])
          }
        })
      } else {
        // Solo limpiamos el formulario si NO recibimos datos de retorno (comportamiento estándar)
        resetForm()
      }

      // 3. Sincronización de Sesión: Si el API retorna nuevo token/rutas
      if (access_token && paths && Array.isArray(paths)) {
        // Mapeo de snake_case (backend) a camelCase (frontend) para pathActive
        const normalizedPaths = paths.map((p: any) => ({
          path: p.path,
          method: p.method,
          pathActive: p.path_active ?? p.pathActive ?? 1
        }))
        authStore.updateSession(access_token, normalizedPaths, (user?.userName || payload.userName))
      }
      
      // Lógica especial de re-autenticación si la API lo requiere
      if (props.config?.config?.isReauthenticating === true || result.data?.isReauthenticating === true) {
        authStore.isReauthenticating = true
      }
    } else {
      feedback.value = { type: 'error', message: result.message }
    }
  }

  /**
   * Maneja acciones disparadas por componentes complejos (ej. navegación, llamadas API especiales).
   */
  async function handleComponentAction(e: any, item: any, childContext?: any) {
    if (e.type === 'pagination-change') {
      const { page, limit } = e.payload
      fetchConsultData({ page, limit })
      return
    }

    // SERVICE LOCATOR INTERCEPTOR: Si recibimos una acción de 'edit' y tenemos metadatos dinámicos,
    // abrimos un submódulo virtual con ese esquema inmediatamente.
    if (e.type === 'edit' && dynamicComponentMetadata.value) {
      console.log('[Orchestrator] Launching virtual submodule from dynamic metadata')
      activeSubmodule.value = {
        config: { 
          module: 'Editar Registro',
          metadata: { title: 'Editar Registro' }
        },
        schema: dynamicComponentMetadata.value
      }
      // Limpiar y cargar data
      Object.keys(submoduleModel).forEach(k => delete submoduleModel[k])
      
      const rowData = { ...(e.payload || {}) }
      // Normalización para Selects (ej: de array de roles a string de role)
      if (Array.isArray(rowData.roles) && rowData.roles.length > 0) {
        rowData.role = rowData.role || rowData.roles[0]
      }
      
      Object.assign(submoduleModel, rowData)
      return
    }

    if (e.type === 'back') {
      // Si hay un submódulo activo, el botón 'volver' debe simplemente cerrarlo
      if (activeSubmodule.value) {
        backToMain()
        return
      }
      const fromPath = route.query.fromPath as string
      fromPath ? router.push(fromPath) : router.back()
      return
    }

    // Prioridad de configuración de acciones: 
    // 1. Item local (botón) 
    // 2. Contexto de hijo (si existe) 
    // 3. Configuración global del módulo
    const actionsConfig = item.config?.actions || 
                        item.actions || 
                        childContext?.config?.actions || 
                        props.config?.config?.actions || 
                        props.config?.configurationUi?.actions
    
    if (!actionsConfig || !actionsConfig[e.type]) return

    const actionDef = rendererService.prepareAction(actionsConfig[e.type], e.payload || {})

    // Navegación con persistencia de parámetros
    if (actionDef.type === 'navigate' && actionDef.path) {
      const queryParams: any = { ...actionDef.params }
      if (actionDef.params?.mode === 'edit' && e.payload) {
        try { queryParams._rd = btoa(encodeURIComponent(JSON.stringify(e.payload))) } catch {}
      }

      // INTERCEPTOR: Si la acción corresponde a un submódulo local, swapeamos la vista en lugar de navegar
      const schemaChildren = props.config?.schemaChild || props.config?.configurationUi?.schemaChild || []
      const localSubmodule = schemaChildren.find((child: any) => {
        // PRIORIDAD 1: El nombre de la acción (e.type) está registrado como una acción del hijo
        const hasActionTrigger = (child.config?.actions && child.config.actions[e.type]) || (child.actions && child.actions[e.type])
        if (hasActionTrigger) return true

        // PRIORIDAD 2: El path o moduleId coinciden directamente
        const childPath = child.config?.path || child.path
        const childModuleId = child.config?.moduleId || child.moduleId
        
        // REGLA: Si es una acción de editar de TablaPremium (típicamente tiene ID y va a /edit), no interceptamos
        if (actionDef.path?.includes('/edit') && e.payload?.id) return false

        return (childPath && childPath === actionDef.path) || (childModuleId && childModuleId === actionDef.moduleId)
      })

      if (localSubmodule) {
        activateSubmodule(localSubmodule)
      } else {
        router.push({
          path: actionDef.path,
          query: { 
            ...queryParams, 
            fromPath: route.path, 
            fromLabel: props.config?.config?.metadata?.title || props.config?.config?.module 
          }
        })
      }
    } else if (actionDef.type === 'api-call' && actionDef.endpoint) {
      isSubmitting.value = true
      
      const isUnified = actionDef.useMasterModel === true || actionDef.config?.useMasterModel === true
      const currentModel = (activeSubmodule.value && !isUnified) ? submoduleModel : model
      
      const result = await rendererService.executeApiCall(actionDef, currentModel)
      if (result.success) {
        feedback.value = { type: 'success', message: 'Acción realizada con éxito' }
        
        // Limpieza del formulario tras éxito (según requerimiento de usuario)
        resetForm()

        actionDef.onSuccess === 'back' ? router.back() : fetchConsultData()
      } else {
        feedback.value = { type: 'error', message: result.message }
      }
      isSubmitting.value = false
    }
  }

  /**
   * Obtiene el valor real de un campo, manejando casos de datos complejos y arrays vacíos.
   */
  function getFieldValue(item: any) {
    const prop = DynamicParser.getProp(item)
    const val = model[prop]
    const isEmpty = val === undefined || val === null || (Array.isArray(val) ? val.length === 0 : (typeof val === 'string' && val === ''))
    
    if (isEmpty && DynamicParser.isComplex(item.type || '')) {
      return model
    }
    return val
  }

  /**
   * Determina si alguno de los hijos tiene un botón de submit maestro.
   */
  const hasChildSubmit = computed(() => {
    const children = props.config?.schemaChild || props.config?.configurationUi?.schemaChild || []
    return children.some((child: any) => 
      (child.module || []).some((fld: any) => fld.action === 'submit-master')
    )
  })

  // --- Observadores (Watchers) ---

  // Re-inicializa el modelo cuando el esquema de configuración cambia
  watch(() => props.config, () => {
    // FIX: Al cambiar la configuración (navegación entre módulos), reseteamos el estado de submódulos
    backToMain() 
    
    initModel()
    wasSubmitted.value = false
    feedback.value = null
    fetchConsultData()
  }, { immediate: true, deep: true })

  // Carga datos de consulta adicionales si los detalles de orquestación cambian
  watch(() => props.orchestrationDetails, (newVal) => {
    if (newVal) fetchConsultData()
  }, { immediate: true, deep: true })

  // FIX: Si el usuario recupera la sesión (tras una re-autenticación), 
  // volvemos a pedir los datos automáticamente para refrescar la UI.
  // Usamos el token como disparador ya que siempre cambia tras un login exitoso.
  watch(() => authStore.sessionToken, (newToken) => {
    if (newToken) {
      console.log('[Orchestrator] Session token updated, re-fetching data...')
      fetchConsultData()
    }
  })

  return {
    model,
    schema,
    isDashboardView,
    processedBreadcrumbs,
    isSubmitting,
    wasSubmitted,
    feedback,
    fieldRefs,
    validationErrors,
    backendErrors,
    updateModel,
    handleButtonClick,
    handleComponentAction,
    getFieldValue,
    activeSubmodule,
    submoduleModel,
    backToMain,
    hasChildSubmit,
    updateSubmoduleModel,
    initModel // Exportamos para re-uso si es necesario
  }
}
