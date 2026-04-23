import { markRaw, type Component, defineAsyncComponent } from 'vue'
import type { SchemaField } from '@/lib/types/module'
import { ServiceLocator } from './ServiceLocator'

// --- Direct Imports to avoid TDZ (Circular Dependency) ---
import DefaultFallback from '@/components/atoms/special/DefaultFallback.vue'
import TitleNative from '@/components/atoms/display/TitleNative.vue'
import HrNative from '@/components/atoms/display/HrNative.vue'
import InvoiceNative from '@/components/atoms/special/InvoiceNative.vue'
import InvoiceListNative from '@/components/atoms/table/InvoiceListNative.vue'

// Lazy load DrawOwner to break the circular dependency: ChainHandler -> DrawOwner -> ServiceLocator -> ChainHandler
const DrawOwner = defineAsyncComponent(() => import('@/components/atoms/special/DrawOwner.vue'))

/**
 * Cadena de responsabilidad: resuelve el componente según el esquema paramétrico.
 * Usa un mapeo directo para tipos críticos para evitar fallos de resolución.
 * Se utilizan importaciones directas para evitar ciclos con index.ts.
 */
export function getComponentForSchema(item: SchemaField): Component {
  const rawType = (item.type || 'text').toLowerCase().trim()
  const prop = (item.property ?? '').trim().replace(/_/g, '-')
  const label = (item.label || '').toLowerCase()

  console.log('[ChainHandler] Resolving component for:', { rawType, prop, label })

  // 0. HEURISTICA EXTREMA: Si parece una factura, es InvoiceListNative (PRIORIDAD MAXIMA)
  const isInvoice = rawType.includes('invoice') || prop.includes('invoice') || label.includes('invoice') || label.includes('factura')
  if (isInvoice && (rawType === 'table' || rawType.includes('list') || rawType === 'text')) {
    console.log('[ChainHandler] EXTREME MATCH: Returning InvoiceListNative')
    return markRaw(InvoiceListNative)
  }

  // 1. Mapeo Directo (Bulletproof para componentes clave de Dashboard)
  if (['list-invoices', 'invoices-list', 'list_invoices'].includes(rawType)) {
    return markRaw(InvoiceListNative)
  }
  if (rawType === 'title') return markRaw(TitleNative)
  if (rawType === 'hr' || rawType === 'separator') return markRaw(HrNative)
  if (rawType === 'invoice' || rawType === 'single-invoice') return markRaw(InvoiceNative)
  
  // 2. Componentes Especiales / Alta Prioridad
  if (rawType === 'owner' || rawType === 'draw') {
    return markRaw(DrawOwner)
  }

  // 3. Resolver por Type via ServiceLocator
  if (ServiceLocator.has(rawType)) {
    return ServiceLocator.get(rawType)!
  }

  // 4. Fallback por Property (Variantes visuales)
  if (prop) {
    const isInvoiceModule = prop.includes('invoice') || (item.label || '').toLowerCase().includes('invoice')
    if (isInvoiceModule) {
      console.log('[ChainHandler] FORCED MATCH: Returning InvoiceListNative')
      return markRaw(InvoiceListNative)
    }
    const byProp = ServiceLocator.get(prop) ?? ServiceLocator.get(prop.replace(/-/g, '_'))
    if (byProp) return byProp
  }

  // 5. Fallback final
  return markRaw(DefaultFallback)
}
