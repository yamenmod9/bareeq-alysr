// API Response Types
export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface TransactionFilters extends PaginationParams, DateRangeParams {
  status?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface SettlementFilters extends PaginationParams, DateRangeParams {
  status?: string;
  search?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'customer' | 'merchant' | 'admin';
}

export interface RegisterData {
  email: string;
  password: string;
  phone_number?: string;
  role: 'customer' | 'merchant';
  full_name: string;
  national_id?: string;
  // Merchant-specific fields
  shop_name?: string;
  shop_name_ar?: string;
  commercial_registration?: string;
  vat_number?: string;
  business_phone?: string;
  business_email?: string;
  address?: string;
  city?: string;
}
