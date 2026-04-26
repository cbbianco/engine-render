import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import { useNotificationStore } from '@/stores/notifications'
import { RouteUtils } from '@/utils/renderer/RouteUtils'
import { DynamicParser } from '@/utils/renderer/DynamicRenderer.utils'
import { rendererService } from '@/services/renderer/RendererService'
import { ClickUtils, type ClickContext } from '@/utils/renderer/ClickUtils'

/**
 * useRendererOrchestrator - Orquestador lógico del DynamicRenderer.
 */
export function useRendererOrchestrator(props: any, emit: any) {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // --- Estado Reactivo ---
  const isSubmitting = ref(false)
  const wasSubmitted = ref(false)
  const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  const fieldRefs = new Map<string, unknown>()
  const validationErrors = reactive<Record<string, { invalid: boolean; message?: string }>>({})
  const backendErrors = reactive<Record<string, string>>({})
  const model = reactive({}) as any
  const criticalConfigError = ref<string | null>(null)
  
  // --- Sistema de Confirmación ---
  const confirmState = reactive({
    show: false,
    title: '¿Está seguro?',
    message: 'Esta acción no se puede deshacer.',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    onConfirm: () => {}
  })

  // --- Estados de Navegación Interna (Submódulos) ---
  const activeSubmodule = ref<any>(null)
  const submoduleModel = reactive({}) as any

  // --- Computados ---
  const schema = computed(() => props.config?.schema || props.config?.configurationUi?.schema || [])
  const isDashboardView = computed(() => !route.params.moduleId && route.path === '/dashboard')
  const processedBreadcrumbs = computed(() => RouteUtils.getBreadcrumbs(route, props.config, activeSubmodule.value))
  const hasChildSubmit = computed(() => {
    const children = props.config?.schemaChild || props.config?.configurationUi?.schemaChild || []
    return children.some((c: any) => c.config?.trigger === 'submit-master')
  })

  // --- Ciclo de Vida ---
  onMounted(() => {
    initModel()
  })

  // --- Watchers ---
  watch(() => props.config, () => {
    initModel()
  }, { deep: true })

  watch(() => route.path, () => {
    activeSubmodule.value = null
    feedback.value = null
  })

  // --- Métodos de Acción ---

  async function initModel() {
    try {
      Object.keys(model).forEach(key => delete model[key])
      const queryData = RouteUtils.getDataFromQuery(route.query)
      if (queryData) {
        Object.assign(model, queryData)
        return
      }
      const consultConfig = (props.orchestrationDetails?.consult as any) || (props.config?.orchestrationDetails?.consult as any)
      
      if (consultConfig) {
        const id = (route.query.id as string) || (props.config as any)?.config?.moduleId
        // Si hay configuración de consulta, la ejecutamos. 
        // No bloqueamos por ID ya que algunos endpoints (como /profile) usan el token.
        const response = await rendererService.fetchConsultData(consultConfig, { 
          id, 
          moduleId: id, // Soporte para placeholders {moduleId}
          ...model 
        })
        if (response && !response.error) {
          // Lógica de seteo universal:
          // 1. Preservamos la estructura original para componentes complejos (Table/Kanban)
          Object.assign(model, response)
          
          // 2. Si hay un objeto 'data' (no array), lo aplanamos para campos simples (Inputs)
          if (response.data && !Array.isArray(response.data)) {
            Object.assign(model, response.data)
          }
        }
      }
    } catch (error: any) {
      criticalConfigError.value = `Error al cargar datos iniciales: ${error.message}`
    }
  }

  function updateModel(key: string, value: any) {
    model[key] = value
    if (validationErrors[key]) delete validationErrors[key]
    if (backendErrors[key]) delete backendErrors[key]
  }

  function updateSubmoduleModel(key: string, value: any) {
    submoduleModel[key] = value
  }

  /**
   * Delegación total a ClickUtils para el manejo de botones.
   */
  async function handleButtonClick(btn: any, childContext?: any) {
    await ClickUtils.handleButtonClick(btn, getClickContext(), childContext)
  }

  function confirmAction(source: any, callback: () => void) {
    const config = source.config || source
    confirmState.title = config.confirmTitle || '¿Está seguro?'
    confirmState.message = config.confirmMessage || 'Esta acción no se puede deshacer.'
    confirmState.confirmLabel = config.confirmLabel || 'Confirmar'
    confirmState.cancelLabel = config.cancelLabel || 'Cancelar'
    confirmState.onConfirm = callback
    confirmState.show = true
  }

  /**
   * Proporciona el contexto necesario para las utilidades de clic.
   */
  function getClickContext(): ClickContext {
    return {
      model,
      submoduleModel,
      schema,
      activeSubmodule,
      validationErrors,
      isSubmitting,
      wasSubmitted,
      feedback,
      route,
      props,
      backToMain,
      fetchConsultData,
      executeApiCall: (item, payload) => rendererService.executeApiCall(item, payload),
      handleApiResult: (result, item) => handleApiResult(result, item),
      handleComponentAction: (e, item, childContext) => handleComponentAction(e, item, childContext),
      notificationStore,
      confirmAction: (source, cb) => confirmAction(source, cb)
    }
  }

  function handleApiResult(result: any, actionDef: any) {
    if (result.success) {
      notificationStore.addNotification('success', 'Éxito', result.data?.message || 'Operación completada')
      feedback.value = { type: 'success', message: result.data?.message || 'Operación exitosa' }
      
      // Auto-navegación si el submit fue exitoso
      if (actionDef.action === 'submit' || actionDef.action === 'submit-master') {
        setTimeout(() => {
          const fromPath = route.query.fromPath as string
          fromPath ? router.push(fromPath) : router.back()
        }, 1500)
      }

      if (actionDef.refresh !== false) {
        fetchConsultData()
      }
    } else {
      feedback.value = { type: 'error', message: result.message }
      notificationStore.addNotification('error', 'Error', result.message)
    }
  }

  function activateSubmodule(config: any) {
    activeSubmodule.value = config
    Object.keys(submoduleModel).forEach(k => delete submoduleModel[k])
  }

  function backToMain() {
    activeSubmodule.value = null
  }

  function getFieldValue(keyOrItem: string | any) {
    const key = typeof keyOrItem === 'string' ? keyOrItem : DynamicParser.getProp(keyOrItem)
    return model[key]
  }

  async function handleComponentAction(e: { type: string; payload: any }, item: any, childContext?: any) {
    if (e.type === 'edit' && e.payload) {
      const rowData = { ...e.payload }
      if (rowData.roles && Array.isArray(rowData.roles)) {
        rowData.role = rowData.role || rowData.roles[0]
      }
      Object.assign(submoduleModel, rowData)
      return
    }

    if (e.type === 'back') {
      if (activeSubmodule.value) {
        backToMain()
        return
      }
      const fromPath = route.query.fromPath as string
      fromPath ? router.push(fromPath) : router.back()
      return
    }

    const actionsConfig = item.config?.actions ||
      item.actions ||
      childContext?.config?.actions ||
      props.config?.config?.actions ||
      props.config?.configurationUi?.actions

    if (!actionsConfig || !actionsConfig[e.type]) return

    const actionDef = rendererService.prepareAction(actionsConfig[e.type], e.payload || {})

    if (actionDef.type === 'navigate' && (actionDef.path || actionDef.moduleId)) {
      const queryParams: any = { ...actionDef.params }
      if (actionDef.params?.mode === 'edit' && e.payload) {
        try { queryParams._rd = btoa(encodeURIComponent(JSON.stringify(e.payload))) } catch { }
      }

      let targetPath = actionDef.path
      if (actionDef.moduleId) {
        const targetModule = authStore.modulesConfig.find((m: any) => {
          const cfg = m.configurationUi?.config || m.configuration_ui?.config
          return m._id === actionDef.moduleId || m.modulo === actionDef.moduleId || cfg?.moduleId === actionDef.moduleId
        })
        
        if (targetModule) {
          const cfg = targetModule.configurationUi?.config || (targetModule as any).configuration_ui?.config
          const resolvedPath = cfg?.path || (targetModule as any).path
          if (resolvedPath && resolvedPath !== route.path) {
            targetPath = resolvedPath
          }
        }
      }

      const schemaChildren = props.config?.schemaChild || props.config?.configurationUi?.schemaChild || []
      const localSubmodule = schemaChildren.find((child: any) => {
        const hasActionTrigger = (child.config?.actions && child.config.actions[e.type]) || (child.actions && child.actions[e.type])
        if (hasActionTrigger) return true
        const childPath = child.config?.path || child.path || (child.configurationUi?.config?.path)
        const childModuleId = child.config?.moduleId || child.moduleId || (child.configurationUi?.config?.moduleId)
        if (actionDef.path?.includes('/edit') && e.payload?.id) return false
        return (childPath && childPath === actionDef.path) || (childModuleId && childModuleId === actionDef.moduleId)
      })

      if (localSubmodule) {
        activateSubmodule(localSubmodule)
      } else if (targetPath) {
        router.push({
          path: targetPath as string,
          query: {
            ...queryParams,
            fromPath: route.path,
            fromLabel: props.config?.config?.metadata?.title || props.config?.config?.module
          }
        })
      }
    } else if (actionDef.type === 'api-call' && actionDef.endpoint) {
      const needsConfirm = actionDef.confirm === true || (typeof actionDef.endpoint === 'object' && actionDef.endpoint.confirm === true)
      
      if (needsConfirm) {
        const confirmSource = typeof actionDef.endpoint === 'object' && actionDef.endpoint.confirm === true ? actionDef.endpoint : actionDef
        confirmAction(confirmSource, () => ClickUtils.handleButtonClick(actionDef, getClickContext()))
        return
      }

      await ClickUtils.handleButtonClick(actionDef, getClickContext())
    }
  }

  async function fetchConsultData() {
    const consultConfig = props.config?.orchestrationDetails?.consult
    const id = route.query.id as string || (props.config?.config?.moduleId)
    if (consultConfig) {
      try {
        const response = await rendererService.fetchConsultData(consultConfig, { moduleId: id })
        Object.assign(model, response)
      } catch (error) {
        console.error('[Orchestrator] Error al refrescar datos:', error)
      }
    }
  }

  watch(() => route.query.id, (newId) => {
    if (newId) initModel()
  })

  function handleBreadcrumbClick(item: any) {
    ClickUtils.handleBreadcrumbClick(item, getClickContext())
  }

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
    criticalConfigError,
    initModel,
    handleBreadcrumbClick,
    confirmState
  }
}
