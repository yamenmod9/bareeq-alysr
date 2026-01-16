import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, FileText } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Button, Card, CardContent } from '../../components/ui';
import { useCurrency } from '../../hooks/useCurrency';
import { formatDate } from '../../utils/date';
// Types are inferred from API responses

export default function Repayments() {
  const { t } = useTranslation(['customer', 'common']);
  const { formatCurrency } = useCurrency();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useQuery({
    queryKey: ['repayment-plans'],
    queryFn: () => customerService.getRepaymentPlans(),
  });

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcoming-payments'],
    queryFn: () => customerService.getUpcomingPayments(),
  });

  const plans = plansData?.data || [];
  const upcomingPayments = upcomingData?.data || [];
  const isLoading = plansLoading || upcomingLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'active':
      case 'pending':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'defaulted':
        return 'text-red-800 bg-red-200 dark:text-red-300 dark:bg-red-900/50';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
      case 'defaulted':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
            {t('customer:repayments.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('customer:repayments.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchPlans()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common:refresh')}
        </Button>
      </div>

      {/* Upcoming Payments Summary */}
      {upcomingPayments.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                {t('customer:repayments.upcoming_payments')}
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment.schedule_id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('customer:repayments.installment')} #{payment.installment_number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('customer:repayments.due')}: {formatDate(payment.due_date)}
                    </p>
                  </div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repayment Plans */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('customer:repayments.no_plans')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('customer:repayments.no_plans_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.plan_id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Plan Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedPlan(expandedPlan === plan.plan_id ? null : plan.plan_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t('customer:repayments.plan_type', { months: plan.plan_type })}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('customer:repayments.ref')}: {plan.reference_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(plan.total_amount)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {getStatusIcon(plan.status)}
                          {t(`common:status_object.${plan.status}`)}
                        </span>
                      </div>
                      {expandedPlan === plan.plan_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('customer:repayments.progress')}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {plan.installments_paid} / {plan.number_of_installments} {t('customer:repayments.installments')}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all"
                        style={{ width: `${(plan.installments_paid / plan.number_of_installments) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600 dark:text-green-400">
                        {t('customer:repayments.paid')}: {formatCurrency(plan.amount_paid)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('customer:repayments.remaining')}: {formatCurrency(plan.remaining_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Schedule */}
                {expandedPlan === plan.plan_id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      {t('customer:repayments.payment_schedule')}
                    </h4>
                    <div className="space-y-3">
                      {/* Simulated schedule items based on plan data */}
                      {Array.from({ length: plan.number_of_installments }).map((_, index) => {
                        const isPaid = index < plan.installments_paid;
                        const isCurrent = index === plan.installments_paid;
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isPaid
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : isCurrent
                                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isPaid ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : isCurrent ? (
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                              )}
                              <div>
                                <p className={`font-medium ${isPaid ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                                  {t('customer:repayments.installment')} #{index + 1}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {isPaid ? t('customer:repayments.paid_status') : isCurrent ? t('customer:repayments.current') : t('customer:repayments.upcoming')}
                                </p>
                              </div>
                            </div>
                            <span className={`font-semibold ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                              {formatCurrency(plan.installment_amount)}
                            </span>
                          </div>
                        );
                      })}
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
