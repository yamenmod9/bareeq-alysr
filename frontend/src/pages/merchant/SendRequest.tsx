import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Search, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { merchantService } from '../../services/merchant.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import type { Customer } from '../../types/models';

export default function SendRequest() {
  const { t } = useTranslation(['merchant', 'common']);
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  
  const [customerCode, setCustomerCode] = useState('');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [customerError, setCustomerError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    quantity: 1,
    price: '',
    branch_id: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: branchesData } = useQuery({
    queryKey: ['merchant-branches'],
    queryFn: () => merchantService.getBranches(),
  });

  const branches = branchesData?.data || [];

  const lookupCustomer = async () => {
    if (!customerCode) return;
    
    setLookupLoading(true);
    setCustomerError('');
    setCustomerData(null);
    
    try {
      const response = await merchantService.lookupCustomer(customerCode);
      if (response.data) {
        setCustomerData(response.data);
      }
    } catch (error: any) {
      setCustomerError(error.message || t('merchant:send_request.customer_not_found'));
    } finally {
      setLookupLoading(false);
    }
  };

  const sendRequestMutation = useMutation({
    mutationFn: (data: any) => merchantService.sendPurchaseRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-stats'] });
      setShowSuccess(true);
      // Reset form
      setCustomerCode('');
      setCustomerData(null);
      setFormData({
        product_name: '',
        product_description: '',
        quantity: 1,
        price: '',
        branch_id: '',
      });
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) return;

    sendRequestMutation.mutate({
      customer_id: customerData.customer_id,
      product_name: formData.product_name,
      product_description: formData.product_description || undefined,
      quantity: formData.quantity,
      price: parseFloat(formData.price),
      branch_id: formData.branch_id ? parseInt(formData.branch_id) : undefined,
    });
  };

  const totalAmount = formData.quantity * (parseFloat(formData.price) || 0);
  const canAfford = customerData ? totalAmount <= (customerData.available_balance || 0) : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('merchant:send_request.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('merchant:send_request.subtitle')}
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-700 dark:text-green-300">
              {t('merchant:send_request.success_message')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Lookup */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('merchant:send_request.customer_lookup')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('merchant:send_request.customer_code')}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
                    placeholder={t('merchant:send_request.enter_customer_code')}
                    className="font-mono tracking-wider"
                    maxLength={8}
                  />
                  <Button onClick={lookupCustomer} disabled={lookupLoading || !customerCode}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Customer Error */}
              {customerError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm">{customerError}</span>
                </div>
              )}

              {/* Customer Info */}
              {customerData && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customerData.full_name || customerData.user?.full_name || t('merchant:send_request.customer')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {customerData.customer_code}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:send_request.credit_limit')}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(customerData.credit_limit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('merchant:send_request.available')}</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(customerData.available_balance || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    customerData.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {customerData.status === 'active' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {t(`common:status_object.${customerData.status}`)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Request Form */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('merchant:send_request.purchase_details')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('merchant:send_request.product_name')} *
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder={t('merchant:send_request.product_name_placeholder')}
                  required
                  disabled={!customerData}
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('merchant:send_request.product_description')}
                </label>
                <textarea
                  value={formData.product_description}
                  onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none disabled:opacity-50"
                  rows={3}
                  placeholder={t('merchant:send_request.product_description_placeholder')}
                  disabled={!customerData}
                />
              </div>

              {/* Quantity & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:send_request.quantity')} *
                  </label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                    disabled={!customerData}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:send_request.unit_price')} *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    disabled={!customerData}
                  />
                </div>
              </div>

              {/* Branch Selection */}
              {branches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('merchant:send_request.branch')}
                  </label>
                  <select
                    id="branch-select"
                    title={t('merchant:send_request.branch')}
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                    disabled={!customerData}
                  >
                    <option value="">{t('merchant:send_request.select_branch')}</option>
                    {branches.map((branch: any) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Total Amount */}
              {formData.price && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('merchant:send_request.total_amount')}</span>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  
                  {customerData && (
                    <div className={`mt-2 flex items-center gap-2 text-sm ${
                      canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {canAfford ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t('merchant:send_request.within_limit')}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          {t('merchant:send_request.exceeds_limit')}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!customerData || !formData.product_name || !formData.price || !canAfford || sendRequestMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendRequestMutation.isPending ? t('common:loading') : t('merchant:send_request.send_request')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
