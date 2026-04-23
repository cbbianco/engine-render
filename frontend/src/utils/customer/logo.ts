/**
 * Convierte una URL de Google Drive "view" (página) en URL directa para usar en <img>.
 * Ej: .../file/d/FILE_ID/view?usp=sharing → .../uc?export=view&id=FILE_ID
 */
export function toDirectImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`
  }
  return url
}
