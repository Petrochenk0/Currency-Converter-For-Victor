import type { Currency } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  amount: number;
  from: Currency;
  to: Currency;
  rate: number | null;
  inverseRate: number | null;
  isLoading: boolean;
  error: string | null;
}

export const ConversionResult: React.FC<Props> = ({
  amount,
  from,
  to,
  rate,
  inverseRate,
  isLoading,
  error,
}) => {
  // Предотвращаем NaN и мигание
  const result = rate !== null ? amount * rate : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Conversion result</h3>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : rate === null ? (
        <p className="text-gray-500">Exchange rate not available</p>
      ) : (
        <>
          <div className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(result, to)}</div>
          <div className="text-sm text-gray-500 mb-6">
            {formatCurrency(amount, from)} → {formatCurrency(result, to)}
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Exchange Rate:</span>{' '}
              <span>
                1 {from.code} = {rate.toFixed(6)} {to.code}
              </span>
            </div>
            <div>
              <span className="font-medium">Inverse Rate:</span>{' '}
              <span>
                1 {to.code} = {inverseRate?.toFixed(6) || '—'} {from.code}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Rates are for informational purposes only and may not reflect real-time market rates.
          </p>
        </>
      )}
    </div>
  );
};
