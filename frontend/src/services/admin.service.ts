import { apiCall } from './api.client';
import { StandardResponse } from '@/types/api';

export interface DashboardStats {
  total_users: number;
  total_customers: number;
  total_merchants: number;
  total_transactions: number;
  active_transactions: number;
  completed_transactions: number;
  pending_purchase_requests: number;
  total_volume: number;
  platform_commission: number;
  pending_settlements: number;
  new_users_today: number;
  new_users_this_week: number;
}

export interface UserItem {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface CustomerItem {
  id: number;
  user_id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  customer_code: string;
  credit_limit: number;
  available_balance: number;
  outstanding_balance: number;
  status: string;
  risk_score: number;
  created_at: string;
  total_transactions: number;
  total_spent: number;
}

export interface MerchantItem {
  id: number;
  user_id: number;
  email: string;
  full_name: string | null;
  shop_name: string;
  status: string;
  is_verified: boolean;
  total_transactions: number;
  total_volume: number;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_number: string;
  customer_email: string;
  merchant_shop: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
  due_date: string;
}

export const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<StandardResponse<DashboardStats>> => {
    return apiCall({ method: 'GET', url: '/admin/dashboard' });
  },

  // Users
  getUsers: async (params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<UserItem[]>> => {
    return apiCall({ method: 'GET', url: '/admin/users', params });
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<StandardResponse> => {
    return apiCall({
      method: 'PUT',
      url: `/admin/users/${userId}/status`,
      data: { is_active: isActive },
    });
  },

  // Customers
  getCustomers: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<CustomerItem[]>> => {
    return apiCall({ method: 'GET', url: '/admin/customers', params });
  },

  updateCustomerLimit: async (customerId: number, newLimit: number): Promise<StandardResponse> => {
    return apiCall({
      method: 'PUT',
      url: `/admin/customers/${customerId}/limit`,
      data: { new_limit: newLimit },
    });
  },

  updateCustomerStatus: async (customerId: number, status: string): Promise<StandardResponse> => {
    return apiCall({
      method: 'PUT',
      url: `/admin/customers/${customerId}/status`,
      params: { status },
    });
  },

  // Merchants
  getMerchants: async (params?: {
    status?: string;
    is_verified?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<MerchantItem[]>> => {
    return apiCall({ method: 'GET', url: '/admin/merchants', params });
  },

  updateMerchantStatus: async (
    merchantId: number,
    status: string,
    isVerified?: boolean
  ): Promise<StandardResponse> => {
    return apiCall({
      method: 'PUT',
      url: `/admin/merchants/${merchantId}/status`,
      data: { status, is_verified: isVerified },
    });
  },

  // Transactions
  getTransactions: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<TransactionItem[]>> => {
    return apiCall({ method: 'GET', url: '/admin/transactions', params });
  },

  // Purchase Requests
  getPurchaseRequests: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<any[]>> => {
    return apiCall({ method: 'GET', url: '/admin/purchase-requests', params });
  },

  // Settlements
  getSettlements: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<StandardResponse<any[]>> => {
    return apiCall({ method: 'GET', url: '/admin/settlements', params });
  },

  approveSettlement: async (settlementId: number): Promise<StandardResponse> => {
    return apiCall({
      method: 'PUT',
      url: `/admin/settlements/${settlementId}/approve`,
    });
  },
};
