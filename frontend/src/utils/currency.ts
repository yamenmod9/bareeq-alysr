/**
 * Format number as Saudi Riyal currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol
 * @param language - Language code ('ar' or 'en')
 * @returns Formatted currency string (e.g., "1,234.00 SAR" or "١٬٢٣٤٫٠٠ ر.س")
 */
export function formatCurrency(amount: number, showSymbol: boolean = true, language: 'ar' | 'en' = 'en'): string {
  // Handle invalid amounts
  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
  
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  if (!showSymbol) return formatted;
  
  const symbol = language === 'ar' ? 'ر.س' : 'SAR';
  return language === 'ar' ? `${formatted} ${symbol}` : `${formatted} ${symbol}`;
}

/**
 * Parse currency string to number
 * @param value - Currency string (e.g., "1,234.00" or "1234.00")
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format percentage
 * @param value - The value to format (e.g., 0.005 for 0.5%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate commission amount
 * @param amount - The base amount
 * @param rate - Commission rate (e.g., 0.005 for 0.5%)
 * @returns Commission amount
 */
export function calculateCommission(amount: number, rate: number = 0.005): number {
  return amount * rate;
}

/**
 * Calculate net amount after commission
 * @param grossAmount - The gross amount
 * @param rate - Commission rate (e.g., 0.005 for 0.5%)
 * @returns Net amount after deducting commission
 */
export function calculateNetAmount(grossAmount: number, rate: number = 0.005): number {
  return grossAmount - calculateCommission(grossAmount, rate);
}

/**
 * Format large numbers with K, M suffixes
 * @param value - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M")
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
