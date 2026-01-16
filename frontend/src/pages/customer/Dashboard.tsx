import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Card, CardHeader, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate, formatCountdown } from '../../utils/date';
import type { PurchaseRequest, RepaymentSchedule } from '../../types/models';

export default function CustomerDashboard() {
  const { t } = useTranslation(['customer', 'common']);
  const { formatCurrency } = useCurrency();

  const { data: limitsData } = useQuery({
    queryKey: ['customer', 'limits'],
    queryFn: () => customerService.getLimits(),
  });

  const { data: requestsData } = useQuery({
    queryKey: ['customer', 'requests'],
    queryFn: () => customerService.getRequests({ status: 'all', page: 1, page_size: 5 }),
  });

  const { data: schedulesData } = useQuery({
    queryKey: ['customer', 'schedules'],
    queryFn: () => customerService.getSchedules({ status: 'pending', page: 1, page_size: 5 }),
  });

  const limits = limitsData?.data;
  const requests = requestsData?.data?.items || [];
  const schedules = schedulesData?.data?.items || [];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('customer:dashboard')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('customer:dashboard_subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('customer:available_limit')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(limits?.available_limit || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('customer:used_limit')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(limits?.used_limit || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('customer:total_limit')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(limits?.total_limit || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('customer:pending_payments')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {schedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Requests */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('customer:recent_requests')}
          </h2>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('customer:no_requests')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: PurchaseRequest) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.merchant?.shop_name || t('customer:merchant')}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[request.status as keyof typeof statusColors]
                        }`}
                      >
                        {t(`common:status_${request.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(request.total_amount)}
                    </p>
                    {request.status === 'pending' && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        <Clock className="w-3 h-3 inline me-1" />
                        {formatCountdown(request.expires_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('customer:upcoming_payments')}
          </h2>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('customer:no_pending_payments')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule: RepaymentSchedule) => (
                <div
                  key={schedule.schedule_id || schedule.installment_number}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('customer:installment_number', { number: schedule.installment_number })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('common:due_date')}: {formatDate(schedule.due_date)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(schedule.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        statusColors[schedule.status as keyof typeof statusColors]
                      }`}
                    >
                      {t(`common:status_${schedule.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
