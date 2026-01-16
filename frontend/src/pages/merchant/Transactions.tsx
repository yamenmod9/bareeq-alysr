import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Receipt, Search, Filter, ChevronDown, ChevronUp, 
  Calendar, User, Package, CheckCircle, XCircle, 
  AlertCircle, Hourglass, Download, Eye, X, CreditCard, Clock
} from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';
import type { Transaction } from '../../types/models';

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Hourglass className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  active: <AlertCircle className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  approved: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  rejected: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  cancelled: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
  active: 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30',
};

export default function Transactions() {
  const { t } = useTranslation(['merchant', 'common']);
  const { formatCurrency } = useCurrency();
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    start_date: '',
    end_date: '',
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['merchant-transactions', filters],
    queryFn: () => merchantService.getTransactions({
      status: filters.status || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    }),
  });

  const transactions: Transaction[] = transactionsData?.data || [];
  
  // Filter by search locally
  const filteredTransactions = transactions.filter((tx: Transaction) => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      tx.product_name?.toLowerCase().includes(search) ||
      tx.transaction_id?.toString().includes(search) ||
      tx.customer?.user?.full_name?.toLowerCase().includes(search)
    );
  });

  // Stats
  const stats = {
    total: transactions.length,
    pending: transactions.filter((t: Transaction) => t.status === 'pending').length,
    completed: transactions.filter((t: Transaction) => t.status === 'completed').length,
    totalAmount: transactions.reduce((sum: number, t: Transaction) => sum + (t.total_amount || 0), 0),
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '', start_date: '', end_date: '' });
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDownload = (transaction: Transaction) => {
    // Generate a simple receipt as downloadable text/HTML
    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Transaction Receipt - ${transaction.transaction_number || transaction.transaction_id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #7C3AED; }
    .title { font-size: 18px; color: #666; margin-top: 10px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .value { font-weight: bold; }
    .total { font-size: 20px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
    .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .status-active { background: #E0E7FF; color: #4338CA; }
    .status-completed { background: #D1FAE5; color: #059669; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">✨ Bareeq Al-Ysr</div>
    <div class="title">Transaction Receipt</div>
  </div>
  
  <div class="info-row">
    <span class="label">Transaction #</span>
    <span class="value">${transaction.transaction_number || transaction.transaction_id}</span>
  </div>
  <div class="info-row">
    <span class="label">Date</span>
    <span class="value">${formatDate(transaction.created_at)}</span>
  </div>
  <div class="info-row">
    <span class="label">Status</span>
    <span class="value"><span class="status status-${transaction.status}">${transaction.status?.toUpperCase()}</span></span>
  </div>
  <div class="info-row">
    <span class="label">Product</span>
    <span class="value">${transaction.product_name || 'N/A'}</span>
  </div>
  <div class="info-row">
    <span class="label">Quantity</span>
    <span class="value">${transaction.quantity || 1}</span>
  </div>
  <div class="info-row">
    <span class="label">Unit Price</span>
    <span class="value">${formatCurrency(transaction.price || transaction.total_amount)}</span>
  </div>
  <div class="info-row">
    <span class="label">Customer ID</span>
    <span class="value">#${transaction.customer_id}</span>
  </div>
  
  <div class="info-row total">
    <span class="label">Total Amount</span>
    <span class="value">${formatCurrency(transaction.total_amount)}</span>
  </div>
  
  <div class="footer">
    <p>Thank you for using Bareeq Al-Ysr BNPL Services</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.transaction_number || transaction.transaction_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('merchant:transactions.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('merchant:transactions.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          {t('common:filters')}
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:transactions.total_transactions')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:transactions.pending')}</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:transactions.completed')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('merchant:transactions.total_amount')}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common:search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                    placeholder={t('merchant:transactions.search_placeholder')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common:status')}
                </label>
                <select
                  id="status-filter"
                  title={t('common:status')}
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common:all')}</option>
                  <option value="pending">{t('common:status_object.pending')}</option>
                  <option value="approved">{t('common:status_object.approved')}</option>
                  <option value="active">{t('common:status_object.active')}</option>
                  <option value="completed">{t('common:status_object.completed')}</option>
                  <option value="rejected">{t('common:status_object.rejected')}</option>
                  <option value="cancelled">{t('common:status_object.cancelled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common:start_date')}
                </label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common:end_date')}
                </label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="ghost" onClick={clearFilters}>
                {t('common:clear_filters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('merchant:transactions.no_transactions')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('merchant:transactions.no_transactions_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction: Transaction) => (
            <Card key={transaction.transaction_id}>
              <CardContent className="p-0">
                {/* Main Row */}
                <button 
                  className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 text-left"
                  onClick={() => setExpandedId(expandedId === transaction.transaction_id ? null : transaction.transaction_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.product_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>#{transaction.transaction_id}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(transaction.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.total_amount)}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status] || statusColors.pending}`}>
                        {statusIcons[transaction.status]}
                        {t(`common:status_object.${transaction.status}`)}
                      </span>
                    </div>
                    {expandedId === transaction.transaction_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === transaction.transaction_id && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {/* Customer Info */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('merchant:transactions.customer')}</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {transaction.customer?.user?.full_name || t('merchant:transactions.customer')} #{transaction.customer_id}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('merchant:transactions.product_details')}</p>
                        <p className="text-gray-900 dark:text-white">
                          {transaction.quantity || 1} x {formatCurrency(transaction.price || transaction.total_amount)}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('merchant:transactions.payment_info')}</p>
                        <p className="text-gray-900 dark:text-white">
                          {transaction.installments || 1} {t('merchant:transactions.installments')}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {transaction.product_description && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('merchant:transactions.description')}</p>
                        <p className="text-gray-700 dark:text-gray-300">{transaction.product_description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(transaction)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('common:view_details')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(transaction)}>
                        <Download className="w-4 h-4 mr-2" />
                        {t('common:download')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardContent className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('merchant:transactions.transaction_details')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    #{selectedTransaction.transaction_number || selectedTransaction.transaction_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedTransaction.status] || statusColors.pending}`}>
                  {statusIcons[selectedTransaction.status]}
                  {t(`common:status_object.${selectedTransaction.status}`)}
                </span>
              </div>

              {/* Transaction Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:transactions.product')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.product_name || 'N/A'}</p>
                  {selectedTransaction.product_description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedTransaction.product_description}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:transactions.customer')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.customer?.user?.full_name || `Customer #${selectedTransaction.customer_id}`}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:transactions.created_date')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedTransaction.created_at)}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:transactions.due_date')}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.due_date ? formatDate(selectedTransaction.due_date) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('merchant:transactions.payment_details')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('merchant:transactions.quantity')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.quantity || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('merchant:transactions.unit_price')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedTransaction.price || selectedTransaction.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('merchant:transactions.paid_amount')}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(selectedTransaction.paid_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('merchant:transactions.remaining_amount')}</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(selectedTransaction.remaining_amount || selectedTransaction.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white font-medium">{t('merchant:transactions.total_amount')}</span>
                    <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                      {formatCurrency(selectedTransaction.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Info */}
              {selectedTransaction.commission_amount !== undefined && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-6">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t('merchant:transactions.commission_info', {
                      rate: ((selectedTransaction.commission_rate || 0.005) * 100).toFixed(1),
                      amount: formatCurrency(selectedTransaction.commission_amount || 0)
                    })}
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                  {t('common:close')}
                </Button>
                <Button onClick={() => handleDownload(selectedTransaction)}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('common:download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
