import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Store,
  CreditCard,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import { adminService, DashboardStats } from '@/services/admin.service';

export default function AdminDashboard() {
  const { t } = useTranslation(['admin', 'common']);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const data = stats?.data as DashboardStats;

  const statCards = [
    {
      title: t('admin:dashboard.total_users'),
      value: data?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: t('admin:dashboard.total_customers'),
      value: data?.total_customers || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: t('admin:dashboard.total_merchants'),
      value: data?.total_merchants || 0,
      icon: Store,
      color: 'bg-purple-500',
    },
    {
      title: t('admin:dashboard.total_transactions'),
      value: data?.total_transactions || 0,
      icon: Receipt,
      color: 'bg-orange-500',
    },
  ];

  const financialCards = [
    {
      title: t('admin:dashboard.total_volume'),
      value: formatCurrency(data?.total_volume || 0),
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: t('admin:dashboard.platform_commission'),
      value: formatCurrency(data?.platform_commission || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  const statusCards = [
    {
      title: t('admin:dashboard.active_transactions'),
      value: data?.active_transactions || 0,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: t('admin:dashboard.completed_transactions'),
      value: data?.completed_transactions || 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: t('admin:dashboard.pending_requests'),
      value: data?.pending_purchase_requests || 0,
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      title: t('admin:dashboard.pending_settlements'),
      value: data?.pending_settlements || 0,
      icon: CreditCard,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin:dashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin:dashboard.subtitle')}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {financialCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${card.color}`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin:dashboard.status_overview')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <div
              key={index}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <card.icon className={`w-8 h-8 mx-auto ${card.color}`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {card.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin:dashboard.new_users')}
        </h2>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <UserPlus className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data?.new_users_today || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin:dashboard.today')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data?.new_users_this_week || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin:dashboard.this_week')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
