import { z } from 'zod';

// Common validation rules
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password cannot exceed 72 characters');

export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits')
  .min(1, 'Phone number is required');

export const nationalIdSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'National ID must be exactly 10 digits');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters');

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount cannot exceed 1,000,000');

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['customer', 'merchant']),
});

// Registration validation
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: nameSchema,
    phone: phoneSchema,
    national_id: nationalIdSchema.optional(),
    role: z.enum(['customer', 'merchant']),
    shop_name: z.string().min(2).max(200).optional(),
    shop_description: z.string().max(1000).optional(),
    commercial_registration_no: z.string().max(50).optional(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'merchant') {
        return !!data.shop_name;
      }
      return true;
    },
    {
      message: 'Shop name is required for merchants',
      path: ['shop_name'],
    }
  );

// Purchase request validation
export const sendPurchaseRequestSchema = z.object({
  customer_id: z.number().positive('Customer ID is required'),
  product_name: z.string().min(2).max(200),
  product_description: z.string().max(1000).optional(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: amountSchema,
  branch_id: z.number().positive().optional(),
});

// Accept purchase validation
export const acceptPurchaseSchema = z.object({
  request_id: z.number().positive('Request ID is required'),
});

// Reject purchase validation
export const rejectPurchaseSchema = z.object({
  request_id: z.number().positive('Request ID is required'),
  rejection_reason: z.string().max(500).optional(),
});

// Update credit limit validation
export const updateLimitSchema = z.object({
  new_limit: z
    .number()
    .positive('New limit must be positive')
    .max(50000, 'Credit limit cannot exceed 50,000 SAR'),
  reason: z.string().max(500).optional(),
});

// Select repayment plan validation
export const selectRepaymentPlanSchema = z.object({
  transaction_id: z.number().positive('Transaction ID is required'),
  plan_type: z.enum(['1', '3', '6', '12', '18', '24'] as const, {
    errorMap: () => ({ message: 'Invalid plan type' }),
  }).transform(val => parseInt(val, 10)),
});

// Make payment validation
export const makePaymentSchema = z.object({
  transaction_id: z.number().positive('Transaction ID is required'),
  amount: amountSchema,
  payment_method: z.enum(['wallet', 'card', 'bank_transfer']).optional(),
});

// Request settlement validation
export const requestSettlementSchema = z.object({
  transaction_id: z.number().positive('Transaction ID is required'),
});

// Lookup customer validation
export const lookupCustomerSchema = z.object({
  customer_id: z.number().positive('Customer ID is required'),
});

// Create branch validation
export const createBranchSchema = z.object({
  branch_name: z.string().min(2).max(200),
  address: z.string().max(500).optional(),
  phone: phoneSchema.optional(),
});

// Helper: Get password strength
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) return 'weak';
  if (password.length < 10) return 'medium';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strength >= 3) return 'strong';
  if (strength >= 2) return 'medium';
  return 'weak';
}

// Helper: Format phone number for Saudi Arabia
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+966${cleaned.substring(1)}`;
  }
  return `+966${cleaned}`;
}

// Helper: Format national ID
export function formatNationalId(id: string): string {
  const cleaned = id.replace(/\D/g, '');
  return cleaned.substring(0, 10);
}
