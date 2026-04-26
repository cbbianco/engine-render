import { eventBus } from '@/utils/events/EventBus';

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
        
        // Ejecución en segundo plano (Fire and Forget) para no generar latencia en la UI
        fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(err => console.error('[EDP] Error al persistir notificación:', err));

      } catch (error) {
        console.error('[EDP] Fallo crítico en el listener de persistencia:', error);
      }
    });

    eventBus.on('notification.markRead', async ({ id }) => {
      this.markAsRead(id).catch(err => console.error('[EDP] Error al marcar como leída:', err));
    });

    eventBus.on('notification.markAllRead', async ({ author }) => {
      this.markAllAsRead(author).catch(err => console.error('[EDP] Error al marcar todas como leídas:', err));
    });
  }

  /**
   * Obtiene las notificaciones persistidas desde el backend.
   */
  public async getHistory(userName: string) {
    try {
      const response = await fetch(`${this.apiUrl}?author=${userName}`);
      if (!response.ok) throw new Error('Error al obtener historial');
      return await response.json();
    } catch (error) {
      console.error('[EDP] Error al cargar historial de notificaciones:', error);
      return [];
    }
  }

  public async markAsRead(id: string) {
    try {
      await fetch(`${this.apiUrl}/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('[EDP] Error al marcar como leída:', err);
    }
  }

  public async markAllAsRead(userName: string) {
    try {
      await fetch(`${this.apiUrl}/read-all?author=${userName}`, { method: 'PATCH' });
    } catch (err) {
      console.error('[EDP] Error al marcar todas como leídas:', err);
    }
  }
}
