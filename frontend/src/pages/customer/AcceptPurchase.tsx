import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Check, X, Clock, Store, Package, AlertCircle, RefreshCw, User, Copy, Calendar } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Button, Card, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate, formatRelativeTime } from '../../utils/date';
import type { PurchaseRequest } from '../../types/models';

export default function AcceptPurchase() {
  const { t } = useTranslation(['customer', 'common']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const installmentOptions = [
    { months: 1, label: t('customer:accept_purchase.pay_full') },
    { months: 3, label: t('customer:accept_purchase.months_3') },
    { months: 6, label: t('customer:accept_purchase.months_6') },
    { months: 12, label: t('customer:accept_purchase.months_12') },
  ];

  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => customerService.getPendingRequests(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: profileData } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerService.getProfile(),
  });

  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    if (profileData?.data?.customer_code) {
      navigator.clipboard.writeText(profileData.data.customer_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const acceptMutation = useMutation({
    mutationFn: ({ requestId, installmentMonths }: { requestId: number; installmentMonths: number }) => 
      customerService.acceptPurchase({ request_id: requestId, installment_months: installmentMonths }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      setSelectedRequest(null);
      setShowAcceptModal(false);
      setSelectedInstallment(1);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason?: string }) =>
      customerService.rejectPurchase({ request_id: requestId, rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
    },
  });

  const handleAccept = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setSelectedInstallment(1);
    setShowAcceptModal(true);
  };

  const confirmAccept = () => {
    if (selectedRequest) {
      acceptMutation.mutate({ requestId: selectedRequest.request_id, installmentMonths: selectedInstallment });
    }
  };

  const handleReject = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ requestId: selectedRequest.request_id, reason: rejectReason });
    }
  };

  const pendingRequests = requests?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t('common:error')}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common:retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('customer:accept_purchase.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('customer:accept_purchase.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Customer Code Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800">
            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-primary-700 dark:text-primary-300">{t('customer:accept_purchase.your_code')}:</span>
            <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
              {profileData?.data?.customer_code || '--------'}
            </span>
            <button
              onClick={copyCode}
              className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
              title={t('common:copy')}
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-primary-500'}`} />
            </button>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common:refresh')}
          </Button>
        </div>
      </div>

      {/* Requests List */}
      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('customer:accept_purchase.no_requests')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('customer:accept_purchase.no_requests_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.request_id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  {/* Request Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.merchant?.shop_name || t('customer:accept_purchase.merchant')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{formatRelativeTime(request.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full">
                      {t('common:status_pending')}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.product_name}
                      </span>
                    </div>
                    {request.product_description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {request.product_description}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('customer:accept_purchase.quantity')}</span>
                        <p className="font-medium text-gray-900 dark:text-white">{request.quantity}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('customer:accept_purchase.unit_price')}</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(request.price)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('customer:accept_purchase.total')}</span>
                        <p className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(request.total_amount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t('customer:accept_purchase.expires')}: {formatDate(request.expires_at)}
                    </span>
                  </div>

                  {/* Reference */}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    {t('customer:accept_purchase.reference')}: {request.reference_number}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(request)}
                      className="flex-1"
                      disabled={acceptMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('customer:accept_purchase.accept')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request)}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      disabled={rejectMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('customer:accept_purchase.reject')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Accept Confirmation Modal with Installment Selection */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('customer:accept_purchase.confirm_accept_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('customer:accept_purchase.confirm_accept_desc', {
                  amount: formatCurrency(selectedRequest.total_amount),
                  merchant: selectedRequest.merchant?.shop_name,
                })}
              </p>

              {/* Installment Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('customer:accept_purchase.select_installment')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {installmentOptions.map((option) => (
                    <button
                      key={option.months}
                      type="button"
                      onClick={() => setSelectedInstallment(option.months)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        selectedInstallment === option.months
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="block font-semibold">{option.label}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(selectedRequest.total_amount / option.months)}/{t('customer:accept_purchase.per_month')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('customer:accept_purchase.accept_warning')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAcceptModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={confirmAccept}
                  className="flex-1"
                  disabled={acceptMutation.isPending}
                >
                  {acceptMutation.isPending ? t('common:loading') : t('common:confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('customer:accept_purchase.confirm_reject_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('customer:accept_purchase.confirm_reject_desc')}
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('customer:accept_purchase.reject_reason_placeholder')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={confirmReject}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? t('common:loading') : t('customer:accept_purchase.reject')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
