import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminService, MerchantItem } from '@/services/admin.service';
import { Button } from '@/components/ui';

export default function AdminMerchants() {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: merchantsData, isLoading, error } = useQuery({
    queryKey: ['admin-merchants', search, statusFilter, verifiedFilter],
    queryFn: () =>
      adminService.getMerchants({
        search: search || undefined,
        status: statusFilter || undefined,
        is_verified: verifiedFilter === '' ? undefined : verifiedFilter === 'true',
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ merchantId, status, isVerified }: { merchantId: number; status: string; isVerified?: boolean }) =>
      adminService.updateMerchantStatus(merchantId, status, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
      showNotification('success', t('admin:merchants.status_updated'));
    },
    onError: () => {
      showNotification('error', t('common:error'));
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const merchants = merchantsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        {t('common:error_loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin:merchants.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin:merchants.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin:merchants.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            title={t('admin:merchants.all_status')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('admin:merchants.all_status')}</option>
            <option value="active">{t('admin:merchants.status_active')}</option>
            <option value="suspended">{t('admin:merchants.status_suspended')}</option>
            <option value="blocked">{t('admin:merchants.status_blocked')}</option>
          </select>

          <select
            title={t('admin:merchants.all_verification')}
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('admin:merchants.all_verification')}</option>
            <option value="true">{t('admin:merchants.verified')}</option>
            <option value="false">{t('admin:merchants.unverified')}</option>
          </select>
        </div>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {merchants.map((merchant: MerchantItem) => (
          <div
            key={merchant.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{merchant.shop_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{merchant.email}</p>
                  {merchant.full_name && (
                    <p className="text-xs text-gray-400">{merchant.full_name}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(merchant.status)}`}>
                  {t(`admin:merchants.status_${merchant.status}`)}
                </span>
                {merchant.is_verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    {t('admin:merchants.verified')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                    <XCircle className="w-3 h-3" />
                    {t('admin:merchants.unverified')}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin:merchants.transactions')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {merchant.total_transactions}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin:merchants.volume')}</p>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {formatCurrency(merchant.total_volume)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400">
                {t('admin:merchants.joined')}: {formatDate(merchant.created_at)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {!merchant.is_verified && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ merchantId: merchant.id, status: merchant.status, isVerified: true })}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t('admin:merchants.verify')}
                </Button>
              )}
              {merchant.status !== 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ merchantId: merchant.id, status: 'active' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:merchants.activate')}
                </Button>
              )}
              {merchant.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ merchantId: merchant.id, status: 'suspended' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:merchants.suspend')}
                </Button>
              )}
              {merchant.status !== 'blocked' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ merchantId: merchant.id, status: 'blocked' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:merchants.block')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {merchants.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Store className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin:merchants.no_merchants')}</p>
        </div>
      )}
    </div>
  );
}
