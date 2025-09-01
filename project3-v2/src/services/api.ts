const API_BASE_URL = 'https://stockmate.com/v1';

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
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Material Entries
  static async getMaterialEntries() {
    return this.request('/material-entries');
  }

  static async createMaterialEntry(data: Partial<MaterialEntry>) {
    return this.request('/material-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateMaterialEntry(id: string, data: Partial<MaterialEntry>) {
    return this.request(`/material-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteMaterialEntry(id: string) {
    return this.request(`/material-entries/${id}`, { method: 'DELETE' });
  }

  static async saveMaterialEntries(entries: MaterialEntry[]) {
    return this.request('/polisher-assignments', {
      method: 'POST',
      body: JSON.stringify(entries),
    });
  }
  // Generic CRUD operations
  static async getEntities(entityType: string) {
    return this.request(`/${entityType}`);
  }

  static async createEntity(entityType: string, data: any) {
    return this.request(`/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateEntity(entityType: string, id: string, data: any) {
    return this.request(`/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteEntity(entityType: string, id: string) {
    return this.request(`/${entityType}/${id}`, { method: 'DELETE' });
  }
}

export default ApiService;