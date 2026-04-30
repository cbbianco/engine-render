import { eventBus } from '@/utils/events/EventBus';
import { apiFetch } from '@/utils/network/api';

/**
 * Servicio encargado de la persistencia de notificaciones en segundo plano (EDP).
 * Escucha eventos del EventBus y los envía al microservicio ms-notifications.
 */
export class NotificationPersistenceService {
  private static instance: NotificationPersistenceService;
  private readonly apiUrl = 'http://localhost:4003/api/v1/notifications';

  private constructor() {
    this.initListeners();
  }

  public static init() {
    if (!NotificationPersistenceService.instance) {
      NotificationPersistenceService.instance = new NotificationPersistenceService();
    }
    return NotificationPersistenceService.instance;
  }

  private initListeners() {
    eventBus.on('notification.persist', async (data) => {
      try {
        console.log('[EDP] Persistiendo notificación en el backend:', data.title);
        
        // Usamos apiFetch para inyectar el Token automáticamente
        apiFetch(this.apiUrl, {
          method: 'POST',
          body: JSON.stringify(data)
        }).catch(err => console.error('[EDP] Error al persistir notificación:', err));

      } catch (error) {
        console.error('[EDP] Fallo crítico en el listener de persistencia:', error);
      }
    });

    eventBus.on('notification.markRead', async ({ id }) => {
      this.markAsRead(id).catch(err => console.error('[EDP] Error al marcar como leída:', err));
    });

    eventBus.on('notification.markAllRead', async () => {
      this.markAllAsRead().catch(err => console.error('[EDP] Error al marcar todas como leídas:', err));
    });
  }

  /**
   * Obtiene las notificaciones persistidas desde el backend de forma segura (con Token).
   */
  public async getHistory() {
    try {
      // Ya no pasamos el author por URL, el backend lo saca del Token
      const response = await apiFetch(this.apiUrl);
      if (!response.ok) throw new Error('Error al obtener historial');
      return await response.json();
    } catch (error) {
      console.error('[EDP] Error al cargar historial de notificaciones:', error);
      return [];
    }
  }

  public async markAsRead(id: string) {
    try {
      await apiFetch(`${this.apiUrl}/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('[EDP] Error al marcar como leída:', err);
    }
  }

  public async markAllAsRead() {
    try {
      await apiFetch(`${this.apiUrl}/read-all`, { method: 'PATCH' });
    } catch (err) {
      console.error('[EDP] Error al marcar todas como leídas:', err);
    }
  }

  public async getConfig() {
    try {
      const response = await apiFetch(`${this.apiUrl}/config`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('[EDP] Error al obtener la configuración:', error);
      return null;
    }
  }

  public async saveConfig(colors: any) {
    try {
      await apiFetch(`${this.apiUrl}/config`, {
        method: 'PATCH',
        body: JSON.stringify({ colors })
      });
    } catch (error) {
      console.error('[EDP] Error al guardar la configuración:', error);
    }
  }
}
