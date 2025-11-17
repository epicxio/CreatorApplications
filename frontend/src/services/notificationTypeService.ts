import api from './api';

export interface NotificationType {
  _id?: string;
  title: string;
  messageTemplate: string;
  roles: string[];
  channels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  schedule?: {
    enabled: boolean;
    type: 'immediate' | 'scheduled';
    time?: string;
    days?: string[];
    date?: string;
    cron?: string;
  };
  eventType?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationTypeFilters {
  isActive?: boolean;
  role?: string;
  search?: string;
}

class NotificationTypeService {
  private baseURL = '/notification-types';

  // Create a new notification type
  async create(notificationType: Omit<NotificationType, '_id' | 'createdAt' | 'updatedAt'>): Promise<NotificationType> {
    const response = await api.post(this.baseURL, notificationType);
    return response.data;
  }

  // Get all notification types with optional filtering
  async getAll(filters?: NotificationTypeFilters): Promise<NotificationType[]> {
    const params = new URLSearchParams();
    
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    
    if (filters?.role) {
      params.append('role', filters.role);
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`${this.baseURL}?${params.toString()}`);
    return response.data;
  }

  // Get notification type by ID
  async getById(id: string): Promise<NotificationType> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Update notification type
  async update(id: string, notificationType: Partial<NotificationType>): Promise<NotificationType> {
    const response = await api.put(`${this.baseURL}/${id}`, notificationType);
    return response.data;
  }

  // Delete notification type (soft delete)
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Toggle active status
  async toggleActive(id: string): Promise<{ message: string; isActive: boolean }> {
    const response = await api.patch(`${this.baseURL}/${id}/toggle`);
    return response.data;
  }

  // Get notification types by role
  async getByRole(role: string): Promise<NotificationType[]> {
    const response = await api.get(`${this.baseURL}/role/${role}`);
    return response.data;
  }
}

export default new NotificationTypeService(); 