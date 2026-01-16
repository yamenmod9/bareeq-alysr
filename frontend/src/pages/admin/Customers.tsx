import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  AlertCircle,
  Edit2,
  Check,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminService, CustomerItem } from '@/services/admin.service';
import { Button } from '@/components/ui';

export default function AdminCustomers() {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingLimit, setEditingLimit] = useState<number | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['admin-customers', search, statusFilter],
    queryFn: () =>
      adminService.getCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const updateLimitMutation = useMutation({
    mutationFn: ({ customerId, limit }: { customerId: number; limit: number }) =>
      adminService.updateCustomerLimit(customerId, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setEditingLimit(null);
      showNotification('success', t('admin:customers.limit_updated'));
    },
    onError: (error: Error) => {
      showNotification('error', error?.message || t('common:error'));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ customerId, status }: { customerId: number; status: string }) =>
      adminService.updateCustomerStatus(customerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      showNotification('success', t('admin:customers.status_updated'));
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

  const customers = customersData?.data || [];

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
          {t('admin:customers.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin:customers.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin:customers.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            title={t('admin:customers.all_status')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('admin:customers.all_status')}</option>
            <option value="active">{t('admin:customers.status_active')}</option>
            <option value="suspended">{t('admin:customers.status_suspended')}</option>
            <option value="blocked">{t('admin:customers.status_blocked')}</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {customers.map((customer: CustomerItem) => (
          <div
            key={customer.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {customer.full_name || customer.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                  <p className="text-xs text-gray-400 font-mono">{customer.customer_code}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {t(`admin:customers.status_${customer.status}`)}
              </span>
            </div>

            {/* Credit Info */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin:customers.credit_limit')}</p>
                {editingLimit === customer.id ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      title={t('admin:customers.credit_limit')}
                      placeholder={t('admin:customers.credit_limit')}
                      value={newLimit}
                      onChange={(e) => setNewLimit(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      title={t('common:save')}
                      onClick={() => updateLimitMutation.mutate({ customerId: customer.id, limit: newLimit })}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      disabled={updateLimitMutation.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      title={t('common:cancel')}
                      onClick={() => setEditingLimit(null)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(customer.credit_limit)}
                    </p>
                    <button
                      title={t('common:edit')}
                      onClick={() => {
                        setEditingLimit(customer.id);
                        setNewLimit(customer.credit_limit);
                      }}
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin:customers.available')}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(customer.available_balance || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin:customers.outstanding')}</p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {formatCurrency(customer.outstanding_balance)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-500 dark:text-gray-400">
                  {t('admin:customers.transactions')}: <strong>{customer.total_transactions}</strong>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('admin:customers.total_spent')}: <strong>{formatCurrency(customer.total_spent)}</strong>
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {t('admin:customers.joined')}: {formatDate(customer.created_at)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {customer.status !== 'active' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ customerId: customer.id, status: 'active' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:customers.activate')}
                </Button>
              )}
              {customer.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ customerId: customer.id, status: 'suspended' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:customers.suspend')}
                </Button>
              )}
              {customer.status !== 'blocked' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ customerId: customer.id, status: 'blocked' })}
                  disabled={updateStatusMutation.isPending}
                >
                  {t('admin:customers.block')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin:customers.no_customers')}</p>
        </div>
      )}
    </div>
  );
}
