export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = new Date(date)
  const diffMs = new Date().getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

  if (diffMins < 60) {
    // Para que no diga "hace 0 minutos" si acaba de ocurrir
    const displayMins = Math.max(1, diffMins)
    return rtf.format(-displayMins, 'minute')
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return rtf.format(-hours, 'hour')
  } else {
    const days = Math.floor(diffMins / 1440)
    return rtf.format(-days, 'day')
  }
}
