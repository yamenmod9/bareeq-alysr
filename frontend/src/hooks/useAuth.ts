import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../types/models';

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // Check if token is expired on mount
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        clearAuth();
      }
    }
  }, [token, clearAuth]);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    if (response.data) {
      setAuth(response.data.access_token, response.data.user);
      
      // Navigate based on role
      if (response.data.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (response.data.user.role === 'merchant') {
        navigate('/merchant/dashboard');
      } else if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
    return response;
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    if (response.data) {
      setAuth(response.data.access_token, response.data.user);
      
      // Navigate based on role
      if (response.data.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (response.data.user.role === 'merchant') {
        navigate('/merchant/dashboard');
      }
    }
    return response;
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
