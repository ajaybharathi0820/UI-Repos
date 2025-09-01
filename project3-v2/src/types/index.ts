export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MaterialEntry {
  id: string;
  itemCode: string;
  itemName: string;
  bagType: string;
  bagWeight: number;
  dozens: number;
  grossWeight: number;
  netWeight: number;
  expectedWeight: number;
  toleranceStatus: 'within' | 'below' | 'above';
  polisherId: string | null;
  polisherName: string | null;
  productAvgWeight: number;
  toleranceDiff: number;
  createdAt: string;
  updatedAt: string;
}

export interface Polisher {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BagType {
  id: string;
  name: string;
  code: string;
  expectedWeight: number;
  tolerance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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