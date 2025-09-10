export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  dateOfBirth: string;
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
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PolisherAssignmentRequest {
  polisherAssignment: {
    polisherId: string;
    polisherName: string;
    items: {
      productId: string;
      productCode: string;
      productName: string;
      bagTypeId: string;
      bagTypeName: string;
      bagWeight: number;
      dozens: number;
      totalWeight: number;
      netWeight: number;
      avgWeight: number;
      productAvgWeight: number;
      toleranceDiff: number;
    }[];
  };
}

export interface PolisherAssignmentItem {
  id: string;
  assignmentId: string;
  productId: string;
  productCode: string;
  productName: string;
  bagTypeId: string;
  bagTypeName: string;
  bagWeight: number;
  dozens: number;
  totalWeight: number;
  netWeight: number;
  avgWeight: number;
  productAvgWeight: number;
  toleranceDiff: number;
}

export interface PolisherAssignment {
  id: string;
  polisherId: string;
  polisherName: string;
  createdDate: string;
  createdBy: string;
  items: PolisherAssignmentItem[];
}

export interface PolisherAssignmentSearch {
  criteria: {
    polisherId?: string;
    productId?: string;
    fromDate?: string;
    toDate?: string;
  };
}

export interface MaterialEntry {
  id: string;
  itemId?: string; // Product ID
  itemCode: string;
  itemName: string;
  bagType: string;
  bagTypeId: string;
  bagWeight: number;
  dozens: number;
  grossWeight: number;
  netWeight: number;
  avgWeight: number;
  expectedWeight: number;
  toleranceStatus: 'within' | 'below' | 'above';
  polisherId: string;
  polisherName: string;
  productAvgWeight: number;
  toleranceDiff: number;
  createdAt: string;
  updatedAt: string;
}