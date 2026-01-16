import { api } from './api.client';
import {
  Customer,
  PurchaseRequest,
  Transaction,
  RepaymentPlan,
  RepaymentSchedule,
  Payment,
  AcceptPurchaseInput,
  RejectPurchaseInput,
  UpdateLimitInput,
  SelectRepaymentPlanInput,
  MakePaymentInput,
  CustomerLimitHistory,
} from '@/types/models';
import { TransactionFilters } from '@/types/api';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

interface CustomerLimits {
  total_limit: number;
  available_limit: number;
  used_limit: number;
}

export const customerService = {
  /**
   * Get customer profile with balances
   */
  getProfile: async () => {
    return api.get<Customer>('/customers/me');
  },

  /**
   * Get credit limits
   */
  getLimits: async () => {
    return api.get<CustomerLimits>('/customers/limits');
  },

  /**
   * Get all purchase requests with pagination
   */
  getRequests: async (params: { status?: string; page?: number; page_size?: number }) => {
    return api.get<PaginatedResponse<PurchaseRequest>>('/customers/requests', { params });
  },

  /**
   * Get repayment schedules with pagination
   */
  getSchedules: async (params: { status?: string; page?: number; page_size?: number }) => {
    return api.get<PaginatedResponse<RepaymentSchedule>>('/customers/schedules', { params });
  },

  /**
   * Get pending purchase requests
   */
  getPendingRequests: async () => {
    return api.get<PurchaseRequest[]>('/customers/pending-requests');
  },

  /**
   * Accept a purchase request
   */
  acceptPurchase: async (data: AcceptPurchaseInput) => {
    return api.post<Transaction>('/customers/accept-purchase', data);
  },

  /**
   * Reject a purchase request
   */
  rejectPurchase: async (data: RejectPurchaseInput) => {
    return api.post<{ message: string }>('/customers/reject-purchase', data);
  },

  /**
   * Request credit limit update
   */
  updateLimit: async (data: UpdateLimitInput) => {
    return api.patch<Customer>('/customers/update-limit', data);
  },

  /**
   * Select repayment plan for a transaction
   */
  selectRepaymentPlan: async (data: SelectRepaymentPlanInput) => {
    return api.post<RepaymentPlan>('/customers/select-repayment-plan', data);
  },

  /**
   * Make payment on a transaction
   */
  makePayment: async (data: MakePaymentInput) => {
    return api.post<{
      payment: Payment;
      transaction: Transaction;
      settlement_status?: string;
    }>('/customers/make-payment', data);
  },

  /**
   * Get transaction history with filters
   */
  getTransactions: async (filters?: TransactionFilters) => {
    return api.get<Transaction[]>('/customers/transactions', {
      params: filters,
    });
  },

  /**
   * Get my transactions with installment details
   */
  getMyTransactions: async (status?: string) => {
    return api.get<any[]>('/customers/my-transactions', {
      params: status ? { status_filter: status } : undefined,
    });
  },

  /**
   * Get all repayment plans
   */
  getRepaymentPlans: async () => {
    return api.get<RepaymentPlan[]>('/customers/repayment-plans');
  },

  /**
   * Get upcoming scheduled payments
   */
  getUpcomingPayments: async () => {
    return api.get<RepaymentSchedule[]>('/customers/upcoming-payments');
  },

  /**
   * Get credit limit history
   */
  getLimitHistory: async () => {
    return api.get<CustomerLimitHistory[]>('/customers/limit-history');
  },
};
