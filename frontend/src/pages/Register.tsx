import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building2, CreditCard, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, CardContent } from '../components/ui';
import type { RegisterData } from '../types/api';

export default function Register() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'merchant'>('customer');
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    phone_number: '',
    role: 'customer',
    full_name: '',
    national_id: '',
    shop_name: '',
    shop_name_ar: '',
    commercial_registration: '',
    vat_number: '',
    business_phone: '',
    business_email: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRoleChange = (role: 'customer' | 'merchant') => {
    console.log('handleRoleChange called with role:', role);
    setSelectedRole(role);
    setFormData((prev) => {
      console.log('Previous formData:', prev);
      const updated = { ...prev, role };
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  useEffect(() => {
    console.log('selectedRole changed to:', selectedRole);
  }, [selectedRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError('');
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

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

    if (!formData.phone_number) {
      newErrors.phone_number = t('errors:required_field');
    } else if (!/^(05|5)\d{8}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = t('errors:invalid_phone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    if (!formData.full_name) {
      newErrors.full_name = t('errors:required_field');
    }

    if (!formData.national_id) {
      newErrors.national_id = t('errors:required_field');
    } else if (!/^\d{10}$/.test(formData.national_id)) {
      newErrors.national_id = t('errors:invalid_national_id');
    }

    if (formData.role === 'merchant') {
      if (!formData.shop_name) {
        newErrors.shop_name = t('errors:required_field');
      }
      if (!formData.commercial_registration) {
        newErrors.commercial_registration = t('errors:required_field');
      } else if (!/^\d{10}$/.test(formData.commercial_registration)) {
        newErrors.commercial_registration = t('errors:invalid_cr_number');
      }
      if (!formData.business_phone) {
        newErrors.business_phone = t('errors:required_field');
      }
      if (!formData.city) {
        newErrors.city = t('errors:required_field');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      // Ensure role is synced before moving to next step
      setFormData((prev) => ({ ...prev, role: selectedRole }));
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // Build payload - only include relevant fields based on role
      const payload: RegisterData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: selectedRole,
        phone_number: formData.phone_number || undefined,
        national_id: formData.national_id || undefined,
      };

      // Add merchant-specific fields only if merchant
      if (selectedRole === 'merchant') {
        payload.shop_name = formData.shop_name || undefined;
        payload.shop_name_ar = formData.shop_name_ar || undefined;
        payload.commercial_registration = formData.commercial_registration || undefined;
        payload.vat_number = formData.vat_number || undefined;
        payload.business_phone = formData.business_phone || undefined;
        payload.business_email = formData.business_email || undefined;
        payload.address = formData.address || undefined;
        payload.city = formData.city || undefined;
      }

      console.log('Submitting registration payload:', payload);
      await register(payload);
      // Navigation handled by useAuth hook
    } catch (error: any) {
      console.error('Registration error:', error);
      setApiError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        t('errors:registration_failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-600 dark:bg-secondary-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl text-white">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth:create_account')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth:register_subtitle')}
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth:select_role')} <span className="text-accent-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('customer')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRole === 'customer'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950 dark:border-primary-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('auth:customer')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('auth:customer_desc')}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('merchant')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRole === 'merchant'
                          ? 'border-secondary-600 bg-secondary-50 dark:bg-secondary-950 dark:border-secondary-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('auth:merchant')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('auth:merchant_desc')}
                      </div>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {selectedRole === 'customer' 
                      ? t('auth:customer_selected_hint')
                      : t('auth:merchant_selected_hint')}
                  </p>
                </div>

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
                />

                <Input
                  type="password"
                  name="password"
                  label={t('auth:password')}
                  placeholder={t('auth:password_placeholder')}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  autoComplete="new-password"
                />

                <Input
                  type="tel"
                  name="phone_number"
                  label={t('auth:phone')}
                  placeholder="05xxxxxxxx"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  leftIcon={<Phone className="w-5 h-5" />}
                  autoComplete="tel"
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {t('common:next')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Badge */}
                <div className="text-center pb-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    selectedRole === 'customer' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300'
                  }`}>
                    {selectedRole === 'customer' ? t('auth:customer') : t('auth:merchant')}
                  </span>
                </div>

                {/* Common Fields */}
                <Input
                  type="text"
                  name="full_name"
                  label={t('auth:full_name')}
                  placeholder={t('auth:full_name_placeholder')}
                  value={formData.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  leftIcon={<User className="w-5 h-5" />}
                  autoComplete="name"
                />

                <Input
                  type="text"
                  name="national_id"
                  label={t('auth:national_id')}
                  placeholder="1234567890"
                  value={formData.national_id}
                  onChange={handleChange}
                  error={errors.national_id}
                  leftIcon={<CreditCard className="w-5 h-5" />}
                  maxLength={10}
                />

                {/* Merchant-Specific Fields */}
                {selectedRole === 'merchant' ? (
                  <>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        {t('auth:business_info')}
                      </h3>
                    </div>

                    <Input
                      type="text"
                      name="shop_name"
                      label={t('auth:shop_name')}
                      placeholder={t('auth:shop_name_placeholder')}
                      value={formData.shop_name || ''}
                      onChange={handleChange}
                      error={errors.shop_name}
                      leftIcon={<Building2 className="w-5 h-5" />}
                    />

                    <Input
                      type="text"
                      name="shop_name_ar"
                      label={t('auth:shop_name_ar')}
                      placeholder={t('auth:shop_name_ar_placeholder')}
                      value={formData.shop_name_ar || ''}
                      onChange={handleChange}
                      error={errors.shop_name_ar}
                      leftIcon={<Building2 className="w-5 h-5" />}
                    />

                    <Input
                      type="text"
                      name="commercial_registration"
                      label={t('auth:commercial_registration')}
                      placeholder="1234567890"
                      value={formData.commercial_registration || ''}
                      onChange={handleChange}
                      error={errors.commercial_registration}
                      leftIcon={<CreditCard className="w-5 h-5" />}
                      maxLength={10}
                    />

                    <Input
                      type="text"
                      name="vat_number"
                      label={t('auth:vat_number')}
                      placeholder="300000000000003"
                      value={formData.vat_number || ''}
                      onChange={handleChange}
                      error={errors.vat_number}
                      leftIcon={<CreditCard className="w-5 h-5" />}
                    />

                    <Input
                      type="tel"
                      name="business_phone"
                      label={t('auth:business_phone')}
                      placeholder="05xxxxxxxx"
                      value={formData.business_phone || ''}
                      onChange={handleChange}
                      error={errors.business_phone}
                      leftIcon={<Phone className="w-5 h-5" />}
                    />

                    <Input
                      type="email"
                      name="business_email"
                      label={t('auth:business_email')}
                      placeholder="business@example.com"
                      value={formData.business_email || ''}
                      onChange={handleChange}
                      error={errors.business_email}
                      leftIcon={<Mail className="w-5 h-5" />}
                    />

                    <Input
                      type="text"
                      name="city"
                      label={t('auth:city')}
                      placeholder={t('auth:city_placeholder')}
                      value={formData.city || ''}
                      onChange={handleChange}
                      error={errors.city}
                      leftIcon={<Building2 className="w-5 h-5" />}
                    />

                    <Input
                      type="text"
                      name="address"
                      label={t('auth:address')}
                      placeholder={t('auth:address_placeholder')}
                      value={formData.address || ''}
                      onChange={handleChange}
                      error={errors.address}
                      leftIcon={<Building2 className="w-5 h-5" />}
                    />
                  </>
                ) : null}

                {apiError && (
                  <div className="flex items-start gap-2 p-3 bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-accent-700 dark:text-accent-300">{apiError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    {t('common:back')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    isLoading={isLoading}
                    leftIcon={<UserPlus className="w-5 h-5" />}
                  >
                    {t('auth:register')}
                  </Button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth:have_account')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t('auth:login')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
