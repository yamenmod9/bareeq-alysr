import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Mail, Phone, CreditCard, Shield, Moon, Sun, Globe, Bell, 
  ChevronRight, Check, LogOut, Edit2, X, Eye, EyeOff, Copy, CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useLocaleStore } from '../../stores/localeStore';
import { customerService } from '../../services/customer.service';
import { userService } from '../../services/user.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';

export default function Settings() {
  const { t, i18n } = useTranslation(['customer', 'common', 'auth', 'settings']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { user, clearAuth, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLocaleStore();
  
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [limitReason, setLimitReason] = useState('');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret?: string;
    qr_code?: string;
    backup_codes?: string[];
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);  const { data: profileData, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerService.getProfile(),
  });

  const { data: limitHistory } = useQuery({
    queryKey: ['limit-history'],
    queryFn: () => customerService.getLimitHistory(),
  });

  const limitMutation = useMutation({
    mutationFn: (data: { new_limit: number; reason?: string }) => customerService.updateLimit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      queryClient.invalidateQueries({ queryKey: ['limit-history'] });
      setShowLimitModal(false);
      setNewLimit('');
      setLimitReason('');
    },
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (data: { full_name?: string; email?: string; phone?: string }) => 
      userService.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      // The API returns StandardResponse with nested data
      const userData = response?.data;
      if (userData) {
        updateUser({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
        });
        // Update local form state as well
        setProfileForm({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      }
      setIsEditingProfile(false);
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string; confirm_password: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    },
  });

  // 2FA mutation
  const twoFactorMutation = useMutation({
    mutationFn: (enabled: boolean) => userService.toggle2FA(enabled),
    onSuccess: (response: { data?: { enabled?: boolean; secret?: string; qr_code?: string; backup_codes?: string[] } }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      if (response.data?.enabled && response.data?.secret) {
        setTwoFactorData({
          secret: response.data.secret,
          qr_code: response.data.qr_code,
          backup_codes: response.data.backup_codes,
        });
      } else {
        setShow2FAModal(false);
        setTwoFactorData(null);
      }
      // Update local user state
      updateUser({ two_factor_enabled: response.data?.enabled });
    },
  });

  const profile = profileData?.data;
  const history = limitHistory?.data || [];

  const handleLogout = () => {
    clearAuth();
  };

  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleProfileSave = () => {
    profileMutation.mutate({
      full_name: profileForm.full_name || undefined,
      email: profileForm.email || undefined,
      phone: profileForm.phone || undefined,
    });
  };

  const handlePasswordChange = () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  const handleToggle2FA = () => {
    const currentlyEnabled = user?.two_factor_enabled || false;
    if (currentlyEnabled) {
      // Disable 2FA
      twoFactorMutation.mutate(false);
    } else {
      // Enable 2FA - show modal first
      setShow2FAModal(true);
      twoFactorMutation.mutate(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const requestLimitChange = () => {
    if (newLimit) {
      limitMutation.mutate({
        new_limit: parseFloat(newLimit),
        reason: limitReason || undefined,
      });
    }
  };

  const sections = [
    { id: 'profile', icon: User, label: t('customer:settings.profile') },
    { id: 'credit', icon: CreditCard, label: t('customer:settings.credit_limit') },
    { id: 'security', icon: Shield, label: t('customer:settings.security') },
    { id: 'appearance', icon: Moon, label: t('customer:settings.appearance') },
    { id: 'notifications', icon: Bell, label: t('customer:settings.notifications') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('customer:settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('customer:settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                    <ChevronRight className="w-4 h-4 mr-auto opacity-50" />
                  </button>
                ))}
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t('common:logout')}
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('customer:settings.profile_info')}
                  </h2>
                  {!isEditingProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileForm({
                          full_name: user?.full_name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        });
                        setIsEditingProfile(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 me-2" />
                      {t('common:edit')}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      <X className="w-4 h-4 me-2" />
                      {t('common:cancel')}
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user?.full_name || user?.name || t('customer:settings.user')}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('customer:settings.customer_account')}
                      </p>
                    </div>
                  </div>

                  {/* Customer Code Display */}
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border border-primary-200 dark:border-primary-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                          {t('customer:settings.your_customer_code')}
                        </p>
                        <p className="text-2xl font-bold font-mono tracking-wider text-primary-900 dark:text-primary-100">
                          {profileData?.data?.customer_code || '--------'}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          {t('customer:settings.share_code_with_merchant')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (profileData?.data?.customer_code) {
                            copyToClipboard(profileData.data.customer_code);
                          }
                        }}
                        className="border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300"
                      >
                        {copiedCode === profileData?.data?.customer_code ? (
                          <>
                            <CheckCircle className="w-4 h-4 me-2" />
                            {t('common:copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 me-2" />
                            {t('common:copy')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {isEditingProfile ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <Input
                        label={t('auth:full_name')}
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        leftIcon={<User className="w-5 h-5" />}
                      />
                      <Input
                        label={t('auth:email')}
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        leftIcon={<Mail className="w-5 h-5" />}
                      />
                      <Input
                        label={t('auth:phone')}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        leftIcon={<Phone className="w-5 h-5" />}
                        placeholder="+966..."
                      />
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleProfileSave}
                          isLoading={profileMutation.isPending}
                        >
                          {t('common:save')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          {t('common:cancel')}
                        </Button>
                      </div>
                      {profileMutation.isError && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {(profileMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || t('common:error')}
                        </p>
                      )}
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth:email')}
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{user?.email}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('auth:phone')}
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{user?.phone || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('auth:national_id')}
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{user?.national_id || '-'}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('customer:settings.member_since')}: {user?.created_at ? formatDate(user.created_at) : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credit Limit Section */}
          {activeSection === 'credit' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    {t('customer:settings.credit_limit')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-sm text-primary-600 dark:text-primary-400">{t('customer:settings.current_limit')}</p>
                      <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                        {formatCurrency(profile?.credit_limit || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">{t('customer:settings.available')}</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(profile?.available_balance || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-sm text-amber-600 dark:text-amber-400">{t('customer:settings.used')}</p>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {formatCurrency((profile?.credit_limit || 0) - (profile?.available_balance || 0))}
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => setShowLimitModal(true)}>
                    {t('customer:settings.request_increase')}
                  </Button>
                </CardContent>
              </Card>

              {/* Limit History */}
              {history.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      {t('customer:settings.limit_history')}
                    </h3>
                    <div className="space-y-3">
                      {history.map((item: { id: number; old_limit: number; new_limit: number; created_at: string; status: string }) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.old_limit)} → {formatCurrency(item.new_limit)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'approved'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : item.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {t(`common:status_object.${item.status}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {t('customer:settings.security')}
                </h2>
                <div className="space-y-4">
                  {/* Password Change */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t('customer:settings.change_password')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('customer:settings.password_desc')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      {t('customer:settings.update_password')}
                    </Button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 ${user?.two_factor_enabled ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t('settings:security.two_factor')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.two_factor_enabled 
                            ? t('settings:security.two_factor_enabled')
                            : t('settings:security.two_factor_desc')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={user?.two_factor_enabled ? 'danger' : 'primary'}
                      size="sm"
                      onClick={handleToggle2FA}
                      isLoading={twoFactorMutation.isPending}
                    >
                      {user?.two_factor_enabled 
                        ? t('settings:security.disable')
                        : t('settings:security.enable')}
                    </Button>
                  </div>

                  {/* Nafath Verification */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 ${user?.is_verified ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t('customer:settings.nafath_verification')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.is_verified ? t('customer:settings.verified') : t('customer:settings.not_verified')}
                        </p>
                      </div>
                    </div>
                    {user?.is_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Button size="sm" variant="outline">
                        {t('customer:settings.verify_now')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {t('customer:settings.appearance')}
                </h2>
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('customer:settings.theme')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'system'] as const).map((t_) => (
                        <button
                          key={t_}
                          onClick={() => handleThemeChange(t_)}
                          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            theme === t_
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {t_ === 'light' && <Sun className="w-6 h-6" />}
                          {t_ === 'dark' && <Moon className="w-6 h-6" />}
                          {t_ === 'system' && <Globe className="w-6 h-6" />}
                          <span className="text-sm font-medium">{t(`common:theme.${t_}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('customer:settings.language')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['ar', 'en'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => handleLanguageChange(l)}
                          className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            language === l
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-lg">{l === 'ar' ? '🇸🇦' : '🇬🇧'}</span>
                          <span className="font-medium">{t(`common:language.${l}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {t('customer:settings.notifications')}
                </h2>
                <div className="space-y-4">
                  {['purchase_requests', 'payment_reminders', 'promotions'].map((key) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t(`customer:settings.notif_${key}`)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`customer:settings.notif_${key}_desc`)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="sr-only peer"
                          aria-label={t(`customer:settings.notif_${key}`)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        <span className="sr-only">{t(`customer:settings.notif_${key}`)}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Limit Request Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('customer:settings.request_increase')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer:settings.new_limit')}
                  </label>
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder={t('customer:settings.enter_amount')}
                    min={profile?.credit_limit || 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer:settings.reason')} ({t('common:optional')})
                  </label>
                  <textarea
                    value={limitReason}
                    onChange={(e) => setLimitReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder={t('customer:settings.reason_placeholder')}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLimitModal(false);
                    setNewLimit('');
                    setLimitReason('');
                  }}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={requestLimitChange}
                  className="flex-1"
                  disabled={limitMutation.isPending || !newLimit}
                >
                  {limitMutation.isPending ? t('common:loading') : t('common:submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings:security.change_password')}
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={t('common:close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label={t('settings:security.current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute end-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label={t('settings:security.new_password')}
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute end-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Input
                  label={t('settings:security.confirm_password')}
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  error={
                    passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password
                      ? t('settings:security.passwords_not_match')
                      : undefined
                  }
                />

                {passwordMutation.isError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {(passwordMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || t('common:error')}
                    </p>
                  </div>
                )}

                {passwordMutation.isSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {t('settings:security.password_changed')}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    isLoading={passwordMutation.isPending}
                    disabled={
                      !passwordForm.current_password ||
                      !passwordForm.new_password ||
                      passwordForm.new_password !== passwordForm.confirm_password
                    }
                  >
                    {t('settings:security.change_password')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                    }}
                  >
                    {t('common:cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && twoFactorData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings:security.two_factor')}
                </h3>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFactorData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={t('common:close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('settings:security.2fa_enabled')}
                  </p>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings:security.secret_key')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
                      {twoFactorData.secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(twoFactorData.secret || '')}
                    >
                      {copiedCode === twoFactorData.secret ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('settings:security.scan_qr')}
                  </p>
                </div>

                {/* Backup Codes */}
                {twoFactorData.backup_codes && twoFactorData.backup_codes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings:security.backup_codes')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {twoFactorData.backup_codes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <code className="font-mono text-sm">{code}</code>
                          <button
                            onClick={() => copyToClipboard(code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedCode === code ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('settings:security.backup_codes_desc')}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFactorData(null);
                  }}
                >
                  {t('common:close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
