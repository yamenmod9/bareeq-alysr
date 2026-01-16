import { api } from './api.client';
import { User, LoginRequest, RegisterRequest } from '@/types/models';

export const authService = {
  /**
   * Login user with email, password, and role
   */
  login: async (credentials: LoginRequest) => {
    return api.post<{ access_token: string; token_type: string; user: User }>(
      '/auth/login',
      credentials
    );
  },

  /**
   * Register new user (customer or merchant)
   */
  register: async (data: RegisterRequest) => {
    return api.post<{ access_token: string; token_type: string; user: User }>(
      '/auth/register',
      data
    );
  },

  /**
   * Get current authenticated user info
   */
  getMe: async () => {
    return api.get<User>('/auth/me');
  },

  /**
   * Verify using Nafath (simulation)
   */
  verifyNafath: async (nationalId: string) => {
    return api.post<{ verified: boolean; message: string }>('/auth/verify-nafath', {
      national_id: nationalId,
    });
  },
};
