import { markRaw, type Component, defineAsyncComponent } from 'vue'

// --- Direct Imports to avoid TDZ (Circular Dependency) with index.ts ---
// --- Input Group ---
import InputNative from '@/components/atoms/input/InputNative.vue'
import EmailInputNative from '@/components/atoms/input/EmailInputNative.vue'
import PasswordInputNative from '@/components/atoms/input/PasswordInputNative.vue'
import PhoneNative from '@/components/atoms/input/PhoneNative.vue'
import UrlNative from '@/components/atoms/input/UrlNative.vue'
import TextareaNative from '@/components/atoms/input/TextareaNative.vue'
import InputPlaceholderNative from '@/components/atoms/input/InputPlaceholderNative.vue'

// --- Selection Group ---
import SelectNative from '@/components/atoms/selection/SelectNative.vue'
import RadioNative from '@/components/atoms/selection/RadioNative.vue'
import CheckboxNative from '@/components/atoms/selection/CheckboxNative.vue'
import SwitchNative from '@/components/atoms/selection/SwitchNative.vue'
import MultipleSelectOptions from '@/components/atoms/selection/MultipleSelectOptions.vue'

// --- Button Group ---
import ButtonNative from '@/components/atoms/button/ButtonNative.vue'

// --- Datetime Group ---
import DatepickerNative from '@/components/atoms/datetime/DatepickerNative.vue'

// --- Table Group ---
import TableNative from '@/components/atoms/table/TableNative.vue'
import TableProducts from '@/components/atoms/table/TableProducts.vue'
import TablePremium from '@/components/atoms/table/TablePremium.vue'
import InvoiceListNative from '@/components/atoms/table/InvoiceListNative.vue'

// --- Display Group ---
import TitleNative from '@/components/atoms/display/TitleNative.vue'
import HrNative from '@/components/atoms/display/HrNative.vue'
import TaskKanbanNative from '@/components/organisms/TaskKanbanNative.vue'
import EstimatedRevenueNative from '@/components/atoms/display/EstimatedRevenueNative.vue'

// --- File Group ---
import FileInputNative from '@/components/atoms/file/FileInputNative.vue'
import FileDefaultNative from '@/components/atoms/file/FileDefaultNative.vue'

// --- Special Group ---
// Lazy load DrawOwner to break the circular dependency: ServiceLocator -> DrawOwner -> ServiceLocator
const DrawOwner = defineAsyncComponent(() => import('@/components/atoms/special/DrawOwner.vue'))

import InvoiceNative from '@/components/atoms/special/InvoiceNative.vue'
import DefaultFallback from '@/components/atoms/special/DefaultFallback.vue'

type TagKey = string

const registry = new Map<TagKey, Component>()

function register(tag: TagKey, component: Component): void {
  registry.set(tag, markRaw(component))
}

/**
 * Registro central: componentes de la plantilla TailAdmin (form-elements).
 * Property sync: el campo property del JSON determina la variante visual.
 */

// --- COMPONENTES CORE / ESTRUCTURALES ---
register('title', TitleNative)
register('hr', HrNative)
register('invoice', InvoiceNative)
register('single-invoice', InvoiceNative)
register('single_invoice', InvoiceNative)
register('list-invoices', InvoiceListNative)
register('list_invoices', InvoiceListNative)
register('invoices-list', InvoiceListNative)

// --- FORM ELEMENTS ---
register('input', InputNative)
register('text', InputNative)
register('input_uri', InputPlaceholderNative)
register('input_body', TextareaNative)
register('input-text', InputNative)
register('input_text', InputNative)
register('inputtext', InputNative)
register('input-with-placeholder', InputPlaceholderNative)
register('email', EmailInputNative)
register('password', PasswordInputNative)
register('file-input', FileInputNative)
register('file-upload', FileInputNative)
register('upload', FileInputNative)
register('file', FileDefaultNative)
register('switch', SwitchNative)
register('toggle', SwitchNative)
register('select', SelectNative)
register('multiple-select-options', MultipleSelectOptions)
register('button', ButtonNative)
register('radio', RadioNative)
register('checkbox', CheckboxNative)
register('datepicker', DatepickerNative)
register('date', DatepickerNative)
register('textarea', TextareaNative)
register('phone', PhoneNative)
register('url', UrlNative)

// --- TABLAS ---
register('table', TablePremium)
register('data-table', TablePremium)
register('table-products', TableProducts)
register('products-list', TableProducts)
register('table-premium', TablePremium)

// --- BOARDS ---
register('kanban-board', TaskKanbanNative)
register('kanban', TaskKanbanNative)
register('task-kanban', TaskKanbanNative)

// --- DASHBOARD CARDS ---
register('estimated_revenue', EstimatedRevenueNative)
register('estimated-revenue', EstimatedRevenueNative)

// --- ESPECIALES ---
register('draw', DrawOwner)
register('fallback', DefaultFallback)

export const ServiceLocator = {
  get(tag: TagKey): Component | undefined {
    if (!tag) return undefined
    return registry.get(tag.toLowerCase()) || registry.get(tag)
  },
  register,
  has(tag: TagKey): boolean {
    if (!tag) return false
    return registry.has(tag.toLowerCase()) || registry.has(tag)
  }
}
