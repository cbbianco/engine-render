/**
 * Extrae el nombre base del módulo a partir de la ruta actual de Vue Router.
 * @param path Ruta completa (ej: /profile/edit o /invoices)
 * @returns El primer segmento significativo (ej: profile o invoices)
 */
export function extractModuleNameFromPath(path: string): string {
  if (!path) return ''
  // Eliminar barra inicial y obtener el primer segmento antes de la siguiente barra o query params
  const segment = path.replace(/^\//, '').split('/')[0]
  return segment || ''
}
