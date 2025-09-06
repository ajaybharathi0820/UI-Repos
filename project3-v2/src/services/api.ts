const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://stockmate.com/v1';
import type { MaterialEntry, PolisherAssignmentRequest } from '../types';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  static async login(credentials: { username: string; password: string }) {
  return this.request('/api/Users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async logout() {
  // No explicit logout endpoint in API; handle client-side
  return Promise.resolve();
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
  return this.request('/api/Users/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Material Entries methods removed. Add them back if you implement MaterialEntries endpoints in your API.

  static async saveMaterialEntries(entries: MaterialEntry[]) {
  return this.request('/api/PolisherAssignments', {
      method: 'POST',
      body: JSON.stringify(entries),
    });
  }
  
  // New: Save polisher assignment with structured payload
  static async savePolisherAssignment(data: PolisherAssignmentRequest) {
  return this.request('/api/PolisherAssignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  // Generic CRUD operations
  static async getEntities(entityType: string) {
  return this.request(`/api/${entityType}`);
  }

  static async createEntity(entityType: string, data: any) {
  return this.request(`/api/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateEntity(entityType: string, id: string, data: any) {
  return this.request(`/api/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteEntity(entityType: string, id: string) {
  return this.request(`/api/${entityType}/${id}`, { method: 'DELETE' });
  }
}

export default ApiService;