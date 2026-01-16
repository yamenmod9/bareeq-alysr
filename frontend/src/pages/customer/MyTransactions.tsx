import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Card, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';

interface TransactionDetail {
  transaction_id: number;
  transaction_number: string;
  merchant_name: string | null;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
  due_date: string | null;
  installment_months: number;
  installment_amount: number;
  paid_installments: number;
  remaining_installments: number;
  next_payment_date: string | null;
  remaining_schedules: Array<{
    id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
  }>;
}

export default function MyTransactions() {
  const { t } = useTranslation(['customer', 'common']);
  const { formatCurrency } = useCurrency();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-transactions', statusFilter],
    queryFn: () => customerService.getMyTransactions(statusFilter || undefined),
  });

  const transactions: TransactionDetail[] = data?.data || [];

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    defaulted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('customer:my_transactions.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('customer:my_transactions.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('common:all')}</option>
            <option value="active">{t('customer:my_transactions.active')}</option>
            <option value="completed">{t('customer:my_transactions.completed')}</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('customer:my_transactions.no_transactions')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <Card key={txn.transaction_id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpand(txn.transaction_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {txn.merchant_name || t('customer:my_transactions.unknown_merchant')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {txn.transaction_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-end">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(txn.total_amount)}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[txn.status] || 'bg-gray-100 text-gray-800'}`}>
                          {txn.status}
                        </span>
                      </div>
                      {expandedId === txn.transaction_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Summary Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('customer:my_transactions.installment_plan')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {txn.installment_months} {t('customer:my_transactions.months')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('customer:my_transactions.monthly_payment')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(txn.installment_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('customer:my_transactions.paid')}</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(txn.paid_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('customer:my_transactions.remaining')}</p>
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(txn.remaining_amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === txn.transaction_id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {t('customer:my_transactions.payment_schedule')}
                      </h4>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('customer:my_transactions.progress')}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {txn.paid_installments} / {txn.installment_months}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${(txn.paid_installments / txn.installment_months) * 100}%` }}
                        />
                      </div>
                    </div>

                    {txn.remaining_schedules.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('customer:my_transactions.upcoming_payments')} ({txn.remaining_installments})
                        </p>
                        {txn.remaining_schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {t('customer:my_transactions.installment')} #{schedule.installment_number}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('customer:my_transactions.due')}: {formatDate(schedule.due_date)}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(schedule.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-green-700 dark:text-green-300">
                          {t('customer:my_transactions.all_paid')}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                      <p>{t('customer:my_transactions.created')}: {formatDate(txn.created_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
