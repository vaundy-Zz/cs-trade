import api from './axios';

export type AlertType = 'PRICE' | 'VOLATILITY' | 'ROI';
export type ConditionOperator =
  | 'ABOVE'
  | 'BELOW'
  | 'EQUALS'
  | 'PERCENTAGE_CHANGE_UP'
  | 'PERCENTAGE_CHANGE_DOWN';

export interface Alert {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: AlertType;
  symbol: string;
  operator: ConditionOperator;
  threshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  triggers?: AlertTrigger[];
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  userId: string;
  triggeredValue: number;
  triggeredAt: string;
  notified: boolean;
  notifiedAt?: string;
}

export interface CreateAlertData {
  name: string;
  description?: string;
  type: AlertType;
  symbol: string;
  operator: ConditionOperator;
  threshold: number;
}

export interface UpdateAlertData extends Partial<CreateAlertData> {
  isActive?: boolean;
}

export const alertsAPI = {
  getAlerts: async (): Promise<Alert[]> => {
    const response = await api.get('/alerts');
    return response.data;
  },

  getAlert: async (id: string): Promise<Alert> => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  createAlert: async (data: CreateAlertData): Promise<Alert> => {
    const response = await api.post('/alerts', data);
    return response.data;
  },

  updateAlert: async (id: string, data: UpdateAlertData): Promise<Alert> => {
    const response = await api.put(`/alerts/${id}`, data);
    return response.data;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  getAlertTriggers: async (
    id: string,
    limit = 50,
    offset = 0
  ): Promise<{
    triggers: AlertTrigger[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await api.get(`/alerts/${id}/triggers`, {
      params: { limit, offset },
    });
    return response.data;
  },
};
