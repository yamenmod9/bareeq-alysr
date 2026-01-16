import { useCallback } from 'react';
import { useLocaleStore } from '../stores/localeStore';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';

/**
 * Hook that provides a language-aware currency formatter
 */
export function useCurrency() {
  const { language } = useLocaleStore();

  const formatCurrency = useCallback(
    (amount: number, showSymbol: boolean = true) => {
      return formatCurrencyUtil(amount, showSymbol, language);
    },
    [language]
  );

  return { formatCurrency };
}
