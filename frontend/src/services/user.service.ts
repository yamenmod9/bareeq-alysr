import { api } from './api.client';

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface TwoFactorResponse {
  enabled: boolean;
  secret?: string;
  qr_code?: string;
  backup_codes?: string[];
}

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  nafath_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  last_login: string | null;
}

export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return api.get<UserProfile>('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileInput) => {
    return api.patch<UserProfile>('/auth/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordInput) => {
    return api.post<{ changed: boolean }>('/auth/change-password', data);
  },

  /**
   * Enable or disable 2FA
   */
  toggle2FA: async (enabled: boolean) => {
    return api.post<TwoFactorResponse>('/auth/2fa', { enabled });
  },

  /**
   * Verify Nafath
   */
  verifyNafath: async (nationalId: string) => {
    return api.post<{ verified: boolean }>('/auth/verify-nafath', null, {
      params: { national_id: nationalId }
    });
  },
};
