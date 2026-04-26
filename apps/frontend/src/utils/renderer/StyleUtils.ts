import type { SchemaField } from '@/lib/types/module'

/**
 * Clase utilitaria para la gestión de estilos y clases visuales del DynamicRenderer.
 */
export class StyleUtils {
  /**
   * Patrones de validación por defecto para reglas comunes.
   */
  public static readonly DEFAULT_PATTERNS: Record<string, { pattern: string; message: string }> = {
    password: { 
      pattern: "^(?=.*[A-Z])(?=.*[0-9]).{8,255}$", 
      message: "Mínimo 8 caracteres, una mayúscula y un número" 
    },
    userName: { 
      pattern: "^[a-zA-Z0-9._]{4,20}$", 
      message: "4-20 caracteres, alfanumérico, punto o guión bajo" 
    },
    nombre: { 
      pattern: "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$", 
      message: "Nombre no válido (2-50 caracteres)" 
    },
    default: {
      pattern: "^.{1,255}$",
      message: "Este campo es requerido"
    }
  }

  /**
   * Calcula el estilo de columna para el grid (12 columnas).
   */
  static columnStyle(item: SchemaField): { gridColumn: string } {
    const col = item.column ?? 'col-12'
    const match = col.match(/^col-(\d+)$/)
    const num = match ? parseInt(match[1] ?? '12', 10) : 12
    const span = Math.min(12, Math.max(1, Number.isNaN(num) ? 12 : num))
    return { gridColumn: `span ${span}` }
  }

  /**
   * Devuelve las clases de alineación flex basadas en la configuración del ítem.
   */
  static alignClass(item: SchemaField): string {
    const align = item.align
    if (!align || align === 'stretch') return ''
    
    const map: Record<string, string> = {
      start: 'flex justify-start items-start',
      center: 'flex justify-center items-center',
      end: 'flex justify-end items-end',
      baseline: 'flex items-baseline'
    }
    return (align in map ? map[align] : '') as string
  }
}
