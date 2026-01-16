import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Wallet, Building2, CheckCircle, AlertCircle, RefreshCw, DollarSign, Calendar, Store } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';
import type { Transaction } from '../../types/models';

export default function Payment() {
  const { t } = useTranslation(['customer', 'common']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'bank_transfer'>('wallet');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ['active-transactions'],
    queryFn: () => customerService.getTransactions({ status: 'active' }),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { transaction_id: number; amount: number; payment_method: string }) =>
      customerService.makePayment(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      queryClient.invalidateQueries({ queryKey: ['repayment-plans'] });
      setShowPaymentModal(false);
      setSelectedTransaction(null);
      setPaymentAmount('');
    },
  });

  const transactions = transactionsData?.data || [];
  const activeTransactions = transactions.filter((t) => t.status === 'active' || t.status === 'overdue');

  const handlePayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentAmount(transaction.remaining_balance.toString());
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (selectedTransaction && paymentAmount) {
      paymentMutation.mutate({
        transaction_id: selectedTransaction.transaction_id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('customer:payment.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('customer:payment.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common:refresh')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.active_transactions')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{activeTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.total_outstanding')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(activeTransactions.reduce((sum, t) => sum + t.remaining_balance, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.overdue')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeTransactions.filter((t) => t.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {activeTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('customer:payment.no_payments')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('customer:payment.no_payments_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeTransactions.map((transaction) => (
            <Card key={transaction.transaction_id} className={transaction.status === 'overdue' ? 'border-red-300 dark:border-red-800' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {transaction.merchant?.shop_name || t('customer:payment.merchant')}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('customer:payment.ref')}: {transaction.reference_number}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {t(`common:status_object.${transaction.status}`)}
                  </span>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.total_amount')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.paid')}</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(transaction.paid_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.remaining')}</p>
                    <p className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(transaction.remaining_balance)}</p>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={transaction.status === 'overdue' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                    {t('customer:payment.due_date')}: {formatDate(transaction.due_date)}
                  </span>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={() => handlePayment(transaction)}
                  className="w-full"
                  variant={transaction.status === 'overdue' ? 'danger' : 'outline'}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('customer:payment.make_payment')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('customer:payment.payment_details')}
              </h3>

              {/* Transaction Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('customer:payment.paying_to')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTransaction.merchant?.shop_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('customer:payment.remaining')}: {formatCurrency(selectedTransaction.remaining_balance)}
                </p>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customer:payment.amount')}
                </label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={selectedTransaction.remaining_balance}
                  step="0.01"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPaymentAmount(selectedTransaction.remaining_balance.toString())}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {t('customer:payment.pay_full')}
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customer:payment.payment_method')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      paymentMethod === 'wallet'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mb-1" />
                    <span className="text-xs">{t('customer:payment.wallet')}</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      paymentMethod === 'card'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-xs">{t('customer:payment.card')}</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1" />
                    <span className="text-xs">{t('customer:payment.bank')}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedTransaction(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={confirmPayment}
                  className="flex-1"
                  disabled={paymentMutation.isPending || !paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  {paymentMutation.isPending ? t('common:loading') : t('customer:payment.confirm_payment')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
