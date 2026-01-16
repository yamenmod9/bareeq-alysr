import { api } from './api.client';
import {
  Merchant,
  MerchantStats,
  PurchaseRequest,
  Transaction,
  Settlement,
  Branch,
  Customer,
  SendPurchaseRequestInput,
  RequestSettlementInput,
  // LookupCustomerInput,
  CreateBranchInput,
} from '@/types/models';
import { TransactionFilters, SettlementFilters } from '@/types/api';

export const merchantService = {
  /**
   * Get merchant profile with shop info
   */
  getProfile: async () => {
    return api.get<Merchant>('/merchants/me');
  },

  /**
   * Send purchase request to customer
   */
  sendPurchaseRequest: async (data: SendPurchaseRequestInput) => {
    return api.post<PurchaseRequest>('/merchants/send-purchase-request', data);
  },

  /**
   * Request settlement/withdrawal for merchant balance
   */
  requestSettlement: async (data: RequestSettlementInput) => {
    return api.post<Settlement>('/merchants/request-withdrawal', data);
  },

  /**
   * Get transaction history with filters
   */
  getTransactions: async (filters?: TransactionFilters) => {
    return api.get<Transaction[]>('/merchants/transactions', {
      params: filters,
    });
  },

  /**
   * Get settlement history with filters
   */
  getSettlements: async (filters?: SettlementFilters) => {
    return api.get<Settlement[]>('/merchants/settlements', {
      params: filters,
    });
  },

  /**
   * Get pending purchase requests sent by merchant
   */
  getPendingRequests: async () => {
    return api.get<PurchaseRequest[]>('/merchants/pending-requests');
  },

  /**
   * Get all purchase requests sent by merchant with optional status filter
   */
  getAllRequests: async (statusFilter?: string) => {
    return api.get<PurchaseRequest[]>('/merchants/purchase-requests', {
      params: statusFilter ? { status_filter: statusFilter } : undefined,
    });
  },

  /**
   * Get merchant business statistics
   */
  getStats: async () => {
    return api.get<MerchantStats>('/merchants/stats');
  },

  /**
   * Create new branch
   */
  createBranch: async (data: CreateBranchInput) => {
    return api.post<Branch>('/merchants/branches', data);
  },

  /**
   * Get all merchant branches
   */
  getBranches: async () => {
    return api.get<Branch[]>('/merchants/branches');
  },

  /**
   * Cancel a pending purchase request
   */
  cancelRequest: async (requestId: number) => {
    return api.post<{ message: string }>(`/merchants/cancel-request/${requestId}`);
  },

  /**
   * Lookup customer by code to check eligibility
   */
  lookupCustomer: async (customerCode: string) => {
    return api.get<Customer>(`/merchants/lookup-customer/${customerCode}`);
  },

  /**
   * Request withdrawal from balance
   */
  requestWithdrawal: async (data: { amount: number; bank_name: string; bank_account: string; iban: string }) => {
    return api.post<{ withdrawn_amount: number; remaining_balance: number; message: string }>('/merchants/request-withdrawal', data);
  },
};
