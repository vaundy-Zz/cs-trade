import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore, Notification } from '../stores/notificationStore';

export function useSSE() {
  const { token } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!token) return;

    const connectSSE = () => {
      const url = `/api/notifications/sse`;
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            console.log('SSE connected:', data.message);
            return;
          }

          const notification: Notification = {
            id: `${data.alertId}-${Date.now()}`,
            ...data,
          };
          
          addNotification(notification);
          console.log('Notification received:', notification);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        
        setTimeout(() => {
          console.log('Reconnecting SSE...');
          connectSSE();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [token, addNotification]);
}
