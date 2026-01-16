import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { Button, Card, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import type { PurchaseRequest } from '../../types/models';

export default function PurchaseRequests() {
  const { t } = useTranslation(['merchant', 'common']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['merchant-all-requests', statusFilter],
    queryFn: () => merchantService.getAllRequests(statusFilter || undefined),
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: number) => merchantService.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-pending-requests'] });
      showNotification('success', t('merchant:request_cancelled'));
    },
    onError: () => {
      showNotification('error', t('common:error'));
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const requests = (requestsData?.data || []).filter((req: PurchaseRequest) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      req.product_name?.toLowerCase().includes(searchLower) ||
      req.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  // Count by status
  const statusCounts = {
    all: requestsData?.data?.length || 0,
    pending: requestsData?.data?.filter((r: PurchaseRequest) => r.status === 'pending').length || 0,
    accepted: requestsData?.data?.filter((r: PurchaseRequest) => r.status === 'accepted').length || 0,
    rejected: requestsData?.data?.filter((r: PurchaseRequest) => r.status === 'rejected').length || 0,
    expired: requestsData?.data?.filter((r: PurchaseRequest) => r.status === 'expired').length || 0,
  };

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
          {t('merchant:purchase_requests.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('merchant:purchase_requests.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:purchase_requests.total')}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.pending}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('merchant:purchase_requests.status_pending')}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.accepted}</p>
            <p className="text-sm text-green-600 dark:text-green-400">{t('merchant:purchase_requests.status_accepted')}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.rejected}</p>
            <p className="text-sm text-red-600 dark:text-red-400">{t('merchant:purchase_requests.status_rejected')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statusCounts.expired}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('merchant:purchase_requests.status_expired')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('merchant:purchase_requests.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            title={t('merchant:purchase_requests.filter_status')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('merchant:purchase_requests.all_status')}</option>
            <option value="pending">{t('merchant:purchase_requests.status_pending')}</option>
            <option value="accepted">{t('merchant:purchase_requests.status_accepted')}</option>
            <option value="rejected">{t('merchant:purchase_requests.status_rejected')}</option>
            <option value="expired">{t('merchant:purchase_requests.status_expired')}</option>
            <option value="cancelled">{t('merchant:purchase_requests.status_cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('merchant:purchase_requests.no_requests')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('merchant:purchase_requests.no_requests_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request: PurchaseRequest) => (
            <Card
              key={request.id}
              className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Product Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.product_name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {t(`merchant:purchase_requests.status_${request.status}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t('merchant:purchase_requests.ref')}: {request.reference_number}
                      </p>
                      {request.product_description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {request.product_description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center: Details */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('merchant:purchase_requests.quantity')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{request.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('merchant:purchase_requests.unit_price')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(request.unit_price || request.price || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('merchant:purchase_requests.total_amount')}</p>
                      <p className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(request.total_amount)}</p>
                    </div>
                  </div>

                  {/* Right: Date & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(request.created_at)}
                    </div>
                    {request.status === 'pending' && !request.is_expired && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          {t('merchant:purchase_requests.expires')}: {formatDate(request.expires_at)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelMutation.mutate(request.id)}
                          disabled={cancelMutation.isPending}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {t('merchant:cancel_request')}
                        </Button>
                      </div>
                    )}
                    {request.status === 'rejected' && request.rejection_reason && (
                      <p className="text-xs text-red-500">
                        {t('merchant:purchase_requests.rejection_reason')}: {request.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
