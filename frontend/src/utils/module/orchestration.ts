/**
 * Architecture: Solutions Team
 * Methodology: AI Driven Development (AIDD)
 * Module: UI Metadata Render Logic
 * -------------------------------------------
 * Contexto para la resolución de orquestación visual.
 * Ahora basado en el principio de "Explicit Typing": se respeta el type del JSON.
 */
export interface OrchestrationContext {
  metadata?: {
    orchestrationType?: string
    [key: string]: any
  }
  originalType?: string
}

/**
 * Firma de una regla de orquestación paramétrica.
 */
export type OrchestrationRule = (context: OrchestrationContext) => string | undefined

const rules: OrchestrationRule[] = []

/**
 * Registra una regla de orquestación (uso futuro para transformaciones de props o contextos).
 */
export function registerOrchestrationRule(rule: OrchestrationRule): void {
  rules.push(rule)
}

/**
 * Resuelve el tag final del componente. 
 * Actualmente es un pasante puro para respetar el principio de Tipado Explícito.
 */
export function resolveOrchestrationTag(context: OrchestrationContext): string {
  const original = context.originalType || ''
  
  // Ejecutamos reglas si existen (para transformaciones controladas)
  for (const rule of rules) {
    const transformation = rule(context)
    if (transformation) return transformation
  }
  
  return original
}

// --- REGISTRO DE REGLAS (Limpias de transformaciones automáticas) ---
// Aquí solo se añadirán reglas si el usuario desea transformaciones explícitas basadas en metadatos.
// Por ahora, el sistema es 100% fiel al 'type' definido en el JSON.
