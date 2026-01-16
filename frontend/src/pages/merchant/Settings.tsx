import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Building, CreditCard, Shield, Bell, Palette,
  ChevronRight, Plus, Edit2, Trash2, MapPin,
  Phone, Mail, Globe, Sun, Moon, Monitor, Check, X, Eye, EyeOff, Copy,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { userService } from '../../services/user.service';
import { useThemeStore } from '../../stores/themeStore';
import { useLocaleStore } from '../../stores/localeStore';
import { useAuthStore } from '../../stores/authStore';
import { Button, Card, CardContent, Input } from '../../components/ui';
import type { Branch, CreateBranchInput } from '../../types/models';

type SettingsSection = 'profile' | 'bank' | 'branches' | 'security' | 'appearance' | 'notifications';

export default function Settings() {
  const { t, i18n } = useTranslation(['merchant', 'common', 'settings']);
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLocaleStore();
  const { user, updateUser } = useAuthStore();
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    branch_name: '',
    address: '',
    city: '',
    phone: '',
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: merchantData } = useQuery({
    queryKey: ['merchant-profile'],
    queryFn: () => merchantService.getProfile(),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['merchant-branches'],
    queryFn: () => merchantService.getBranches(),
  });

  const merchant = merchantData?.data;
  const branches = branchesData?.data || [];

  const createBranchMutation = useMutation({
    mutationFn: (data: CreateBranchInput) => merchantService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-branches'] });
      setShowBranchModal(false);
      resetBranchForm();
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
      queryClient.invalidateQueries({ queryKey: ['merchant-profile'] });
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

  const resetBranchForm = () => {
    setBranchForm({ branch_name: '', address: '', city: '', phone: '' });
    setEditingBranch(null);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBranchMutation.mutate(branchForm);
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

  const sections = [
    { id: 'profile', icon: User, label: t('settings:sections.profile') },
    { id: 'bank', icon: CreditCard, label: t('settings:sections.bank') },
    { id: 'branches', icon: Building, label: t('settings:sections.branches') },
    { id: 'security', icon: Shield, label: t('settings:sections.security') },
    { id: 'appearance', icon: Palette, label: t('settings:sections.appearance') },
    { id: 'notifications', icon: Bell, label: t('settings:sections.notifications') },
  ];

  const themeOptions = [
    { value: 'light', icon: Sun, label: t('settings:theme.light') },
    { value: 'dark', icon: Moon, label: t('settings:theme.dark') },
    { value: 'system', icon: Monitor, label: t('settings:theme.system') },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <Card className="md:w-64 shrink-0">
        <CardContent className="p-2">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as SettingsSection)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="flex-1">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings:sections.profile')}
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Building className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {merchant?.business_name || merchant?.shop_name || merchant?.user?.full_name || t('merchant:settings.merchant')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('merchant:settings.merchant_id')}: {merchant?.merchant_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{t('common:email')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant?.user?.email || '-'}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{t('common:phone')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant?.phone || merchant?.user?.phone || merchant?.user?.phone_number || '-'}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">{t('merchant:settings.cr_number')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant?.cr_number || merchant?.commercial_registration_no || '-'}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{t('merchant:settings.category')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant?.category || '-'}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{t('common:address')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{merchant?.address || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Section */}
        {activeSection === 'bank' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings:sections.bank')}
              </h2>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {merchant?.bank_name || t('merchant:settings.no_bank')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('merchant:settings.primary_account')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t('common:edit')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:settings.account_number')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {merchant?.bank_account ? `**** ${merchant.bank_account.slice(-4)}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:settings.iban')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {merchant?.iban ? `****${merchant.iban.slice(-4)}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('merchant:settings.bank_verification_note')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branches Section */}
        {activeSection === 'branches' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('settings:sections.branches')}
                </h2>
                <Button onClick={() => setShowBranchModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('merchant:settings.add_branch')}
                </Button>
              </div>

              {branches.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('merchant:settings.no_branches')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {branches.map((branch: Branch) => (
                    <div
                      key={branch.branch_id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{branch.branch_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{branch.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings:sections.security')}
              </h2>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('settings:security.password')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings:security.password_desc')}</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                      {t('settings:security.change')}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 ${user?.two_factor_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings:security.two_factor')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.two_factor_enabled 
                            ? t('settings:security.two_factor_enabled')
                            : t('settings:security.two_factor_desc')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={user?.two_factor_enabled ? 'danger' : 'outline'}
                      onClick={handleToggle2FA}
                      isLoading={twoFactorMutation.isPending}
                    >
                      {user?.two_factor_enabled 
                        ? t('settings:security.disable')
                        : t('settings:security.enable')}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('settings:security.api_keys')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings:security.api_keys_desc')}</p>
                    </div>
                    <Button variant="outline">{t('common:manage')}</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings:sections.appearance')}
              </h2>

              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('settings:theme.title')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          theme === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <option.icon className={`w-6 h-6 mx-auto mb-2 ${
                          theme === option.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          theme === option.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'
                        }`}>{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('settings:language.title')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        i18n.changeLanguage('ar');
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        language === 'ar'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-lg font-bold mb-1">العربية</p>
                      <p className="text-sm text-gray-500">Arabic</p>
                      {language === 'ar' && <Check className="w-5 h-5 text-primary-600 mx-auto mt-2" />}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        i18n.changeLanguage('en');
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        language === 'en'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-lg font-bold mb-1">English</p>
                      <p className="text-sm text-gray-500">الإنجليزية</p>
                      {language === 'en' && <Check className="w-5 h-5 text-primary-600 mx-auto mt-2" />}
                    </button>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings:sections.notifications')}
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'new_transactions', label: t('settings:notifications.new_transactions'), desc: t('settings:notifications.new_transactions_desc') },
                  { key: 'settlements', label: t('settings:notifications.settlements'), desc: t('settings:notifications.settlements_desc') },
                  { key: 'customer_activity', label: t('settings:notifications.customer_activity'), desc: t('settings:notifications.customer_activity_desc') },
                  { key: 'promotions', label: t('settings:notifications.promotions'), desc: t('settings:notifications.promotions_desc') },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <span className="sr-only">{item.label}</span>
                      <input type="checkbox" className="sr-only peer" defaultChecked title={item.label} aria-label={item.label} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingBranch ? t('merchant:settings.edit_branch') : t('merchant:settings.add_branch')}
              </h2>

              <form onSubmit={handleBranchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:settings.branch_name')} *
                  </label>
                  <Input
                    value={branchForm.branch_name}
                    onChange={(e) => setBranchForm({ ...branchForm, branch_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common:address')} *
                  </label>
                  <Input
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common:city')} *
                  </label>
                  <Input
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common:phone')}
                  </label>
                  <Input
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setShowBranchModal(false); resetBranchForm(); }} 
                    className="flex-1"
                  >
                    {t('common:cancel')}
                  </Button>
                  <Button type="submit" disabled={createBranchMutation.isPending} className="flex-1">
                    {createBranchMutation.isPending ? t('common:loading') : t('common:save')}
                  </Button>
                </div>
              </form>
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
                    aria-label={showCurrentPassword ? t('common:hide') : t('common:show')}
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
                    aria-label={showNewPassword ? t('common:hide') : t('common:show')}
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
                            aria-label={t('common:copy')}
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
