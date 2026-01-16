import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, CardContent } from '../components/ui';
import type { LoginCredentials } from '../types/api';

export default function Login() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginCredentials, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError('');
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LoginCredentials, string>> = {};

    if (!formData.email) {
      newErrors.email = t('errors:required_field');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors:invalid_email');
    }

    if (!formData.password) {
      newErrors.password = t('errors:required_field');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth:password_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData);
      // Navigation handled by useAuth hook
    } catch (error: any) {
      console.error('Login error:', error);
      setApiError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        t('errors:login_failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl text-white">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('common:app_name')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth:login_subtitle')}
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <Input
                type="email"
                name="email"
                label={t('auth:email')}
                placeholder={t('auth:email_placeholder')}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-5 h-5" />}
                autoComplete="email"
                required
              />

              {/* Password Input */}
              <Input
                type="password"
                name="password"
                label={t('auth:password')}
                placeholder={t('auth:password_placeholder')}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
                required
              />

              {/* API Error */}
              {apiError && (
                <div className="flex items-start gap-2 p-3 bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-accent-700 dark:text-accent-300">{apiError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-5 h-5" />}
              >
                {t('auth:login')}
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth:no_account')}{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {t('auth:register')}
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Test Credentials Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
            {t('common:test_credentials')}:
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div>{t('auth:customer')}: customer@test.com / password123</div>
            <div>{t('auth:merchant')}: merchant@test.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
