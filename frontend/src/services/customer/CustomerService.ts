import { HttpClient } from '@/services/core/http/HttpClient'
import type { CustomerResponse } from '@/model/auth/customer/customer.response.dto'
import { toDirectImageUrl } from '@/utils/customer/logo'
import { type AuthCss, DEFAULT_THEME_CSS } from '@/model/auth/css/auth.css.dto'
import { mergeLoginTexts, type LoginTexts } from '@/model/auth/login-texts.dto'
import * as customerPersist from '@/persistence/customer/customer.persistence'
import * as themeCssPersist from '@/persistence/theme/theme.persistence'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

/**
 * Servicio de API customer (dominio, theme, logo).
 * Los componentes que necesiten datos del customer deben usar esta capa.
 */
export class CustomerService {
  private readonly http: HttpClient

  constructor(baseUrl: string = BASE_URL) {
    this.http = new HttpClient(baseUrl)
  }

  async getByDomain(domain: string): Promise<{ ok: boolean; data?: CustomerResponse }> {
    const { status, data } = await this.http.post<CustomerResponse>(
      '/api/v1/customer',
      { domain }
    )
    const okStatus = status >= 200 && status < 300
    if (!okStatus || !data?.access_token) {
      return { ok: false }
    }
    return { ok: true, data }
  }

  /**
   * Configura los datos iniciales del cliente (branding, textos, tema).
   * @param store El store de auth a hidratar.
   * @param data Los datos provenientes de la API de customer.
   */
  setupCustomerConfig(store: any, data: any): void {
    // 1. Guardar access token inicial
    store.initialToken = data.access_token

    // 2. Procesar logo
    if (data.logo != null && data.logo !== '') {
      const logoUrl = toDirectImageUrl(data.logo)
      store.customerLogo = logoUrl
      customerPersist.persistLogo(logoUrl)
    }

    // 3. Procesar tema CSS
    const theme = (data.css ?? data.colorCss) as AuthCss | undefined
    if (theme != null && typeof theme === 'object' && Object.keys(theme).length > 0) {
      store.themeCss = { ...DEFAULT_THEME_CSS, ...theme }
      themeCssPersist.persistThemeCss(store.themeCss)
    }

    // 4. Procesar textos de login
    store.loginTexts = mergeLoginTexts(
      (data.loginTexts ?? null) as Partial<LoginTexts> | null
    )

    // 5. Guardar llave pública para cifrado
    const pk = data.serverPublicKey || data.publicKey || data.public_key
    if (pk) {
      store.publicKey = pk
    } else {
      store.publicKey = ''
    }

    // 6. Guardar userName sugerido por el cliente
    if (data.userName) {
      store.userName = data.userName
    }
  }
}
