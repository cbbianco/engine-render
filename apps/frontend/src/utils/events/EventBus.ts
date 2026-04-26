import mitt from 'mitt';

type Events = {
  'notification.persist': {
    type: string;
    title: string;
    message: string;
    author: string;
    metadata?: any;
  };
  'notification.markRead': { id: string };
  'notification.markAllRead': { author: string };
};

export const eventBus = mitt<Events>();
