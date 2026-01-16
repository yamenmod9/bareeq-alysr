// User & Authentication Types
export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  user_id: number;
  email: string;
  name: string;
  phone?: string;
  phone_number?: string;
  national_id?: string;
  is_verified: boolean;
  role: UserRole;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  full_name?: string | null;
  two_factor_enabled?: boolean;
  nafath_verified?: boolean;
}

export interface Customer {
  customer_id: number;
  user_id: number;
  customer_code: string;
  credit_limit: number;
  available_balance: number;
  outstanding_balance: number;
  status: 'active' | 'suspended' | 'blocked';
  risk_score: number;
  created_at: string;
  updated_at: string;
  user?: User;
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerLimitHistory {
  id: number;
  customer_id: number;
  old_limit: number;
  new_limit: number;
  requested_limit: number;
  status: 'pending' | 'approved' | 'rejected';
  approval_reason?: string;
  changed_by: string;
  created_at: string;
}

export interface Merchant {
  merchant_id: number;
  id?: number;
  user_id: number;
  shop_name: string;
  business_name?: string;
  shop_description?: string;
  commercial_registration_no?: string;
  commercial_registration?: string;
  cr_number?: string;
  tax_number?: string;
  vat_number?: string;
  bank_name?: string;
  iban?: string;
  bank_account_name?: string;
  bank_account?: string;
  address?: string;
  city?: string;
  category?: string;
  website_url?: string;
  logo_url?: string;
  phone?: string;
  status: 'active' | 'suspended' | 'pending_approval';
  is_verified: boolean;
  total_transactions: number;
  total_volume: number;
  balance: number;
  total_commission_paid: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Branch {
  branch_id: number;
  merchant_id: number;
  branch_name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseRequest {
  id: number;
  request_id: number;
  merchant_id: number;
  customer_id: number;
  branch_id?: number;
  product_name: string;
  product_description?: string;
  quantity: number;
  price: number;
  unit_price?: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  expires_at: string;
  reference_number: string;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  responded_at?: string;
  rejection_reason?: string;
  is_expired?: boolean;
  merchant?: Merchant;
  customer?: Customer;
  branch?: Branch;
}

export interface Transaction {
  id?: number;
  transaction_id: number;
  transaction_number?: string;
  customer_id: number;
  merchant_id: number;
  request_id: number;
  total_amount: number;
  amount?: number;
  paid_amount: number;
  remaining_amount?: number;
  remaining_balance: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: 'active' | 'completed' | 'overdue' | 'defaulted' | 'cancelled' | 'pending';
  due_date: string;
  reference_number: string;
  repayment_plan_id?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // From PurchaseRequest (populated on fetch)
  product_name?: string;
  product_description?: string;
  quantity?: number;
  price?: number;
  installments?: number;
  customer?: Customer;
  merchant?: Merchant;
  repayment_plan?: RepaymentPlan;
}

export interface Payment {
  payment_id: number;
  transaction_id: number;
  customer_id: number;
  repayment_schedule_id?: number;
  amount: number;
  payment_method: 'wallet' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_number: string;
  gateway_reference?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface RepaymentPlan {
  plan_id: number;
  customer_id: number;
  transaction_id: number;
  plan_type: 1 | 3 | 6 | 12 | 18 | 24;
  total_amount: number;
  installment_amount: number;
  number_of_installments: number;
  status: 'active' | 'completed' | 'defaulted';
  installments_paid: number;
  amount_paid: number;
  remaining_amount: number;
  reference_number: string;
  first_installment_date?: string;
  late_fee?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface RepaymentSchedule {
  id?: number;
  schedule_id: number;
  plan_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'skipped';
  paid_at?: string;
  paid_date?: string;
  paid_amount?: number;
  amount_paid: number;
  created_at: string;
  is_overdue?: boolean;
}

export interface Settlement {
  id: number;
  settlement_id?: number;
  settlement_reference: string;
  settlement_type: 'income' | 'withdrawal';
  merchant_id: number;
  transaction_id?: number | null;
  gross_amount: number;
  amount?: number; // for UI display
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference_number?: string;
  bank_name?: string;
  bank_account?: string;
  iban?: string;
  account_name?: string;
  bank_reference?: string;
  notes?: string;
  created_at: string;
  requested_at?: string;
  processed_at?: string;
  completed_at?: string;
  processed_by?: string;
  merchant?: Merchant;
  bank_details?: {
    bank_name: string;
    account_number: string;
    iban?: string;
  };
}

// Form Input Types
export interface LoginRequest {
  email: string;
  password: string;
  role?: 'customer' | 'merchant' | 'admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  name?: string;
  phone?: string;
  national_id?: string;
  role: 'customer' | 'merchant';
  shop_name?: string;
  shop_description?: string;
  commercial_registration_no?: string;
}

export interface SendPurchaseRequestInput {
  customer_id: number;
  product_name: string;
  product_description?: string;
  quantity: number;
  price: number;
  branch_id?: number;
}

export interface AcceptPurchaseInput {
  request_id: number;
  installment_months?: number;
}

export interface RejectPurchaseInput {
  request_id: number;
  rejection_reason?: string;
}

export interface UpdateLimitInput {
  new_limit: number;
  reason?: string;
}

export interface SelectRepaymentPlanInput {
  transaction_id: number;
  plan_type: 1 | 3 | 6 | 12 | 18 | 24;
}

export interface MakePaymentInput {
  transaction_id: number;
  amount: number;
  payment_method?: 'wallet' | 'card' | 'bank_transfer';
}

export interface RequestSettlementInput {
  transaction_id: number;
}

export interface LookupCustomerInput {
  customer_id: number;
}

export interface CreateBranchInput {
  branch_name: string;
  address?: string;
  phone?: string;
}

// Statistics & Dashboard Types
export interface MerchantStats {
  total_transactions: number;
  total_volume: number;
  total_sales: number;
  active_transactions: number;
  completed_transactions: number;
  total_income: number;
  total_settled: number;
  this_month_settled: number;
  balance: number;
  total_commission_paid: number;
  pending_requests?: number;
  completed_settlements?: number;
  average_transaction_value?: number;
  pending_settlements?: number;
  pending_settlements_amount?: number;
}

export interface CustomerProfile extends Customer {
  pending_requests_count: number;
  active_transactions_count: number;
}

export interface MerchantProfile extends Merchant {
  branches: Branch[];
  stats: MerchantStats;
}
