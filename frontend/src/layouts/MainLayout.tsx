import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  CreditCard,
  Settings,
  Store,
  Send,
  Receipt,
  Wallet,
  Home,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useLocaleStore } from '../stores/localeStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';

export default function MainLayout() {
  const { t } = useTranslation(['common', 'customer', 'merchant', 'admin']);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage } = useLocaleStore();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const customerLinks = [
    { to: '/customer/dashboard', icon: LayoutDashboard, label: t('customer:dashboard') },
    { to: '/customer/accept', icon: ShoppingBag, label: t('customer:accept_purchase.title') },
    { to: '/customer/my-transactions', icon: Receipt, label: t('customer:my_transactions.title') },
    { to: '/customer/repayments', icon: Calendar, label: t('customer:repayments.title') },
    { to: '/customer/payment', icon: CreditCard, label: t('customer:payment.title') },
    { to: '/customer/settings', icon: Settings, label: t('common:settings') },
  ];

  const merchantLinks = [
    { to: '/merchant/dashboard', icon: LayoutDashboard, label: t('merchant:dashboard') },
    { to: '/merchant/send', icon: Send, label: t('merchant:send_request.title') },
    { to: '/merchant/requests', icon: FileText, label: t('merchant:purchase_requests.title') },
    { to: '/merchant/transactions', icon: Receipt, label: t('merchant:transactions.title') },
    { to: '/merchant/settlements', icon: Wallet, label: t('merchant:settlements.title') },
    { to: '/merchant/settings', icon: Settings, label: t('common:settings') },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('admin:nav.dashboard') },
    { to: '/admin/users', icon: Home, label: t('admin:nav.users') },
    { to: '/admin/customers', icon: ShoppingBag, label: t('admin:nav.customers') },
    { to: '/admin/merchants', icon: Store, label: t('admin:nav.merchants') },
    { to: '/admin/transactions', icon: Receipt, label: t('admin:nav.transactions') },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'customer' ? customerLinks : merchantLinks;

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">✨</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                  {t('common:app_name')}
                </span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="p-2"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium ms-1">{language === 'ar' ? 'EN' : 'ع'}</span>
              </Button>

              {/* User Info & Logout */}
              <div className="hidden sm:flex items-center gap-3 ms-3 ps-3 border-s border-gray-200 dark:border-gray-700">
                <div className="text-end">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.full_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? t('common:admin') : user?.role === 'customer' ? t('common:customer') : t('common:merchant')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="p-2"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {links.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('common:logout')}</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <aside
              className="w-64 bg-white dark:bg-gray-800 h-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('common:menu')}
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {links.map((link) => (
                  <NavLink key={link.to} {...link} />
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('common:logout')}</span>
                  </button>
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
