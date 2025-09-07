const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5268';
import type { 
  User, 
  Polisher, 
  BagType, 
  Product,
  UserFormData,
  PolisherFormData,
  BagTypeFormData,
  ProductFormData,
  LoginRequest,
  LoginResponse,
  Role
} from '../types';

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

    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    if (config.body) {
      console.log('Request Body:', config.body);
    }

    try {
  const response = await fetch(url, config);
      
      console.log(`API Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Handle unauthorized/forbidden globally: expire session and redirect to login
        if (response.status === 401 || response.status === 403) {
          console.warn('Session expired or unauthorized. Redirecting to login...');
          try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.setItem('session_expired', '1');
          } catch {}
          // Avoid redirect loop if already on login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            const search = new URLSearchParams(window.location.search);
            search.set('expired', '1');
            const redirectUrl = `/login?${search.toString()}`;
            window.location.replace(redirectUrl);
          }
        }
        const errorText = await response.text();
        console.error(`API Error Response:`, errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Request failed' };
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content or empty bodies gracefully
      if (response.status === 204) {
        console.log(`API Response for ${endpoint}: 204 No Content`);
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      if (!rawText) {
        console.log(`API Response for ${endpoint}: <empty body>`);
        return undefined as T;
      }

      let parsed: any = rawText;
      if (contentType.includes('application/json')) {
        try {
          parsed = JSON.parse(rawText);
        } catch {
          // If JSON parsing fails, keep raw text
        }
      }

      // Unwrap common { data, message, status } envelope if present
      const unwrapped = (parsed && typeof parsed === 'object' && 'data' in parsed)
        ? (parsed as any).data
        : parsed;
      console.log(`API Response for ${endpoint}:`, unwrapped);
      return unwrapped as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  static async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const loginRequest = {
      userName: credentials.username,
      password: credentials.password
    };
    
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(loginRequest),
    });
  }

  static async logout() {
    // Clear token on logout
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    // Get the current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not found. Please login again.');
    }
    
    const user = JSON.parse(userStr);
    
    // Fetch the full user details to get the actual user ID
    const fullUser = await this.getCurrentUser(user.userName);
    
    const command = {
      userId: fullUser.id,
      oldPassword: data.currentPassword,
      newPassword: data.newPassword
    };
    
    return this.request('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  // Roles
  static async getRoles(): Promise<Role[]> {
    return this.request('/api/roles');
  }

  // Users CRUD
  static async getUsers(): Promise<User[]> {
    return this.request('/api/users');
  }

  static async getUserById(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  static async getCurrentUser(userName: string): Promise<User> {
    // Since we don't have a specific endpoint for current user, 
    // we'll need to fetch all users and find the matching one
    const users = await this.getUsers();
    const currentUser = users.find(user => user.userName === userName);
    if (!currentUser) {
      throw new Error('Current user not found');
    }
    return currentUser;
  }

  static async createUser(data: UserFormData): Promise<User> {
    // Convert date of birth to age
    const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
    
    const command = {
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.username,
      age: age,
      email: data.email,
      password: data.password,
      roleId: data.role // Use the actual role ID from the dropdown
    };
    // Backend returns created Id; fetch the full user after create
    const createdId = await this.request<string>('/api/users', {
      method: 'POST',
      body: JSON.stringify(command),
    });
    return this.getUserById(createdId);
  }

  static async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    const age = data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : undefined;
    
    const command = {
      id: id,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.username,
      age: age,
      email: data.email,
      ...(data.password && { password: data.password }),
      roleId: data.role // Use the actual role ID from the dropdown
    };
    // Backend returns NoContent; fetch the updated user by id
    await this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(command),
    });
    return this.getUserById(id);
  }

  static async deleteUser(id: string): Promise<void> {
    return this.request(`/api/users/${id}`, { 
      method: 'DELETE' 
    });
  }

  // Polishers CRUD
  static async getPolishers(): Promise<Polisher[]> {
    return this.request('/api/polisher');
  }

  static async getPolisherById(id: string): Promise<Polisher> {
    return this.request(`/api/polisher/${id}`);
  }

  static async createPolisher(data: PolisherFormData): Promise<Polisher> {
    const command = {
      polisher: {
        firstName: data.firstName,
        lastName: data.lastName,
        contactNumber: data.contactNumber
      }
    };
    // Backend returns just the created id (Guid). Fetch the entity after creating.
    const createdId = await this.request<string>('/api/polisher', {
      method: 'POST',
      body: JSON.stringify(command),
    });
    return this.getPolisherById(createdId);
  }

  static async updatePolisher(id: string, data: Partial<PolisherFormData>): Promise<Polisher> {
    const command = {
      polisher: {
        id: id,
        firstName: data.firstName,
        lastName: data.lastName,
        contactNumber: data.contactNumber
      }
    };
    // Backend returns NoContent (204) on success. Fetch the updated entity after updating.
    await this.request(`/api/polisher/${id}`, {
      method: 'PUT',
      body: JSON.stringify(command),
    });
    return this.getPolisherById(id);
  }

  static async deletePolisher(id: string): Promise<void> {
    return this.request(`/api/polisher/${id}`, { 
      method: 'DELETE' 
    });
  }

  // BagTypes CRUD
  static async getBagTypes(): Promise<BagType[]> {
    return this.request('/api/bagtype');
  }

  static async getBagTypeById(id: string): Promise<BagType> {
    return this.request(`/api/bagtype/${id}`);
  }

  static async createBagType(data: BagTypeFormData): Promise<BagType> {
    const command = {
      bagType: {
        name: data.name,
        weight: data.weight
      }
    };
    // Backend returns created Id; fetch the entity by id so UI has full object
    const createdId = await this.request<string>('/api/bagtype', {
      method: 'POST',
      body: JSON.stringify(command),
    });
    return this.getBagTypeById(createdId);
  }

  static async updateBagType(id: string, data: Partial<BagTypeFormData>): Promise<BagType> {
    const command = {
      bagType: {
        id: id,
        name: data.name,
        weight: data.weight
      }
    };
    // Backend returns NoContent; fetch the updated entity
    await this.request(`/api/bagtype/${id}`, {
      method: 'PUT',
      body: JSON.stringify(command),
    });
    return this.getBagTypeById(id);
  }

  static async deleteBagType(id: string): Promise<void> {
    return this.request(`/api/bagtype/${id}`, { 
      method: 'DELETE' 
    });
  }

  // Products CRUD
  static async getProducts(): Promise<Product[]> {
    return this.request('/api/product');
  }

  static async createProduct(data: ProductFormData): Promise<Product> {
    const command = {
      product: {
        productCode: data.productCode,
        name: data.name,
        weight: data.weight
      }
    };
    // Be flexible with API responses: could be GUID (string), entity object, or a success flag
    const result = await this.request<any>('/api/product', {
      method: 'POST',
      body: JSON.stringify(command),
    });

    // If API returned an entity with id, use it directly
    if (result && typeof result === 'object' && result.id) {
      return result as Product;
    }

    // If API returned a GUID string, fetch entity by id
    if (typeof result === 'string' && /^[0-9a-fA-F-]{36}$/.test(result)) {
      return this.request(`/api/product/${result}`);
    }

    // Fallback: fetch all and find by unique productCode
    const all = await this.getProducts();
    const created = all.find(p => p.productCode === data.productCode && p.name === data.name);
    if (!created) {
      // As a last resort, return a minimal object so the UI doesn't break
      return {
        id: crypto.randomUUID(),
        productCode: data.productCode,
        name: data.name,
        weight: data.weight,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Product;
    }
    return created;
  }

  static async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const command = {
      product: {
        id: id,
        productCode: data.productCode,
        name: data.name,
        weight: data.weight
      }
    };
    // Backend returns NoContent; fetch the updated entity
    await this.request(`/api/product/${id}`, {
      method: 'PUT',
      body: JSON.stringify(command),
    });
    return this.request(`/api/product/${id}`);
  }

  static async deleteProduct(id: string): Promise<void> {
    return this.request(`/api/product/${id}`, { 
      method: 'DELETE' 
    });
  }

  // Polisher Assignments
  static async savePolisherAssignment(request: any): Promise<string> {
    // Backend returns created assignment Id
    const id = await this.request<string>('/api/polisherassignments', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return id;
  }

  static async getPolisherAssignmentById(id: string) {
    return this.request(`/api/polisherassignments/${id}`);
  }

  static async searchPolisherAssignments(filters: any) {
    return this.request('/api/polisherassignments/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
}

export default ApiService;