import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { Card, CardHeader, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';
import type { Transaction, Settlement } from '../../types/models';

export default function MerchantDashboard() {
  const { t } = useTranslation(['merchant', 'common']);
  const { formatCurrency } = useCurrency();

  const { data: statsData } = useQuery({
    queryKey: ['merchant', 'stats'],
    queryFn: () => merchantService.getStats(),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['merchant', 'transactions'],
    queryFn: () => merchantService.getTransactions({ page: 1, page_size: 5 }),
  });

  const { data: settlementsData } = useQuery({
    queryKey: ['merchant', 'settlements'],
    queryFn: () => merchantService.getSettlements({ status: 'pending', page: 1, page_size: 5 }),
  });

  const stats = statsData?.data;
  const transactions = transactionsData?.data.items || [];
  const settlements = settlementsData?.data.items || [];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('merchant:dashboard')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('merchant:dashboard_subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('merchant:total_sales')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.total_sales || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('merchant:pending_settlements')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.pending_settlements || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('merchant:completed_transactions')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.completed_transactions || 0}
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
                  {t('merchant:balance')}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(stats?.balance || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {t('merchant:after_commission')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('merchant:recent_transactions')}
          </h2>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('merchant:no_transactions')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-start py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common:customer')}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common:amount')}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common:status')}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common:date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.full_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.customer.email}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[transaction.status as keyof typeof statusColors]
                          }`}
                        >
                          {t(`common:status_${transaction.status}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Settlements */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('merchant:pending_settlements')}
          </h2>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('merchant:no_pending_settlements')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement: Settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('merchant:settlement_period')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(settlement.created_at)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(settlement.net_amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        statusColors[settlement.status as keyof typeof statusColors]
                      }`}
                    >
                      {t(`common:status_${settlement.status}`)}
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
