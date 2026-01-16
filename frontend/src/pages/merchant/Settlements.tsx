import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, Calendar, CheckCircle, Clock, 
  XCircle, Filter,
  Building, AlertCircle
} from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';
import type { Settlement } from '../../types/models';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  processing: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  rejected: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
};

export default function Settlements() {
  const { t } = useTranslation(['merchant', 'common']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    bank_account: '',
    iban: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
  });

  const { data: settlementsData, isLoading } = useQuery({
    queryKey: ['merchant-settlements', filters],
    queryFn: () => merchantService.getSettlements(filters),
  });

  const { data: statsData } = useQuery({
    queryKey: ['merchant-stats'],
    queryFn: () => merchantService.getStats(),
  });

  const settlements: Settlement[] = settlementsData?.data || [];
  const stats = statsData?.data || { balance: 0, pending_settlements: 0, completed_settlements: 0, total_settled: 0, this_month_settled: 0 };

  const requestSettlementMutation = useMutation({
    mutationFn: (data: { amount: number; bank_name: string; bank_account: string; iban: string }) => 
      merchantService.requestSettlement(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-stats'] });
      setShowRequestModal(false);
      setRequestAmount('');
      setBankDetails({ bank_name: '', bank_account: '', iban: '' });
    },
  });

  // Group settlements by month
  const groupedSettlements = settlements.reduce((groups: Record<string, Settlement[]>, settlement: Settlement) => {
    const date = new Date(settlement.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(settlement);
    return groups;
  }, {} as Record<string, Settlement[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('merchant:settlements.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('merchant:settlements.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('common:filters')}
          </Button>
          <Button onClick={() => setShowRequestModal(true)}>
            <Wallet className="w-4 h-4 mr-2" />
            {t('merchant:settlements.request_settlement')}
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100">{t('merchant:settlements.pending_balance')}</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.balance || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-primary-100 mt-4">
              {t('merchant:settlements.available_for_withdrawal')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t('merchant:settlements.total_settled')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats.total_settled || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t('merchant:settlements.all_time')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t('merchant:settlements.this_month')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats.this_month_settled || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="processing">{t('common:status_object.processing')}</option>
                  <option value="completed">{t('common:status_object.completed')}</option>
                  <option value="rejected">{t('common:status_object.rejected')}</option>
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
          </CardContent>
        </Card>
      )}

      {/* Settlements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : settlements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('merchant:settlements.no_settlements')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('merchant:settlements.no_settlements_desc')}
            </p>
            <Button onClick={() => setShowRequestModal(true)}>
              {t('merchant:settlements.request_first')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettlements)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, monthSettlements]: [string, Settlement[]]) => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
              const monthTotal = monthSettlements.reduce((sum: number, s: Settlement) => sum + (s.amount || s.net_amount || 0), 0);

              return (
                <div key={monthKey}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('merchant:settlements.total')}: {formatCurrency(monthTotal)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {monthSettlements.map((settlement: Settlement) => (
                      <Card key={settlement.id || settlement.settlement_reference}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                settlement.settlement_type === 'withdrawal'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : settlement.status === 'completed' 
                                  ? 'bg-green-100 dark:bg-green-900/30' 
                                  : settlement.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}>
                                {settlement.settlement_type === 'withdrawal' ? (
                                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : settlement.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : settlement.status === 'pending' ? (
                                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {settlement.settlement_type === 'withdrawal' 
                                    ? t('merchant:settlements.withdrawal')
                                    : t('merchant:settlements.income')}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(settlement.created_at)}</span>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{settlement.settlement_reference}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`font-bold ${
                                  settlement.settlement_type === 'withdrawal' 
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {settlement.settlement_type === 'withdrawal' ? '-' : '+'}{formatCurrency(settlement.net_amount)}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[settlement.status]}`}>
                                  {t(`common:status_object.${settlement.status}`)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bank Info */}
                          {settlement.bank_name && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Building className="w-4 h-4" />
                                <span>{settlement.bank_name}</span>
                                {settlement.iban && (
                                  <>
                                    <span>•</span>
                                    <span>{settlement.iban.slice(0, 8)}...{settlement.iban.slice(-4)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Request Settlement Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('merchant:settlements.request_settlement')}
              </h2>

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg mb-6">
                <p className="text-sm text-primary-600 dark:text-primary-400">{t('merchant:settlements.available_balance')}</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {formatCurrency(stats.balance || 0)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:settlements.amount')}
                  </label>
                  <Input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={stats.balance || 0}
                    step="0.01"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{t('merchant:settlements.min')}: {formatCurrency(100)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setRequestAmount((stats.balance || 0).toString())}
                    >
                      {t('merchant:settlements.withdraw_all')}
                    </Button>
                  </div>
                </div>

                {parseFloat(requestAmount) > (stats.balance || 0) && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{t('merchant:settlements.exceeds_balance')}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:settlements.bank_name')}
                  </label>
                  <Input
                    type="text"
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    placeholder={t('merchant:settlements.bank_name_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:settlements.bank_account')}
                  </label>
                  <Input
                    type="text"
                    value={bankDetails.bank_account}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_account: e.target.value })}
                    placeholder={t('merchant:settlements.account_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:settlements.iban')}
                  </label>
                  <Input
                    type="text"
                    value={bankDetails.iban}
                    onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value.toUpperCase() })}
                    placeholder="SA00 0000 0000 0000 0000 0000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowRequestModal(false)} className="flex-1">
                  {t('common:cancel')}
                </Button>
                <Button 
                  onClick={() => requestSettlementMutation.mutate({ 
                    amount: parseFloat(requestAmount),
                    bank_name: bankDetails.bank_name,
                    bank_account: bankDetails.bank_account,
                    iban: bankDetails.iban
                  })}
                  disabled={
                    !requestAmount || 
                    parseFloat(requestAmount) <= 0 || 
                    parseFloat(requestAmount) > (stats.balance || 0) ||
                    !bankDetails.bank_name ||
                    !bankDetails.bank_account ||
                    bankDetails.iban.length < 15 ||
                    requestSettlementMutation.isPending
                  }
                  className="flex-1"
                >
                  {requestSettlementMutation.isPending ? t('common:loading') : t('merchant:settlements.request')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
