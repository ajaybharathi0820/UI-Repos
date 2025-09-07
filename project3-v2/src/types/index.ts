export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  age: number;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userName: string;
  role: string;
}

export interface Role {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Polisher {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface BagType {
  id: string;
  name: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

// Form data interfaces (what the UI uses)
export interface UserFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  role: string;
}

export interface PolisherFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
}

export interface BagTypeFormData {
  name: string;
  weight: number;
}

export interface ProductFormData {
  productCode: string;
  name: string;
  weight: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PolisherAssignmentRequest {
  polisherAssignment: {
    polisherId: string;
    polisherName: string;
    createdBy: string;
    items: {
      productId: string;
      productCode: string;
      productName: string;
      bagTypeId: string;
      bagTypeName: string;
      bagWeight: number;
      dozens: number;
      totalWeight: number;
      productAvgWeight: number;
      toleranceDiff: number;
    }[];
  };
}