// src/App.tsx
import { useState, useEffect } from 'react';
import type { Currency } from './types';
import { CURRENCY_LIST } from './utils/currencyList';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchExchangeRates } from './services/exchangeRateService';
import { parseAmount } from './utils/formatCurrency';
import { InputWithDebounce } from './components/InputWithDebounce';
import { CurrencySelector } from './components/CurrencySelector';
import { ConversionResult } from './components/ConversionResult';

const App = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState<Currency>(CURRENCY_LIST[0]);
  const [toCurrency, setToCurrency] = useState<Currency>(CURRENCY_LIST[1]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isOnline = useOnlineStatus();

  // Загрузка состояния из localStorage
  const [savedState, setSavedState] = useLocalStorage<{
    from: string;
    to: string;
    amount: string;
  }>('currency-converter-state', {
    from: fromCurrency.code,
    to: toCurrency.code,
    amount: '1',
  });

  // Применяем сохранённое состояние при загрузке
  useEffect(() => {
    const newFrom = CURRENCY_LIST.find((c) => c.code === savedState.from) || CURRENCY_LIST[0];
    const newTo = CURRENCY_LIST.find((c) => c.code === savedState.to) || CURRENCY_LIST[1];

    if (fromCurrency.code !== newFrom.code) {
      setFromCurrency(newFrom);
    }
    if (toCurrency.code !== newTo.code) {
      setToCurrency(newTo);
    }
    if (amount !== savedState.amount) {
      setAmount(savedState.amount);
    }
  }, [savedState, fromCurrency.code, toCurrency.code, amount]);

  // Сохраняем текущее состояние в localStorage
  useEffect(() => {
    const newState = { from: fromCurrency.code, to: toCurrency.code, amount };
    if (
      savedState.from !== newState.from ||
      savedState.to !== newState.to ||
      savedState.amount !== newState.amount
    ) {
      setSavedState(newState);
    }
  }, [fromCurrency.code, toCurrency.code, amount, savedState, setSavedState]);

  // Загрузка курсов с API
  const loadRates = async () => {
    if (!isOnline) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchExchangeRates();
      setRates(data.rates);
      setLastUpdated(data.date ? new Date(data.date) : new Date()); // ✅ Защита от null
    } catch (err) {
      setError('Failed to fetch exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Автообновление каждые 5 минут
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(loadRates, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Загрузка кэша при старте
  useEffect(() => {
    const cachedRates = localStorage.getItem('exchangeRates');
    const cachedTime = localStorage.getItem('exchangeRatesTime');
    const now = new Date();

    if (cachedRates && cachedTime) {
      const timeDiff = now.getTime() - new Date(cachedTime).getTime();
      if (timeDiff < 5 * 60 * 1000) {
        setRates(JSON.parse(cachedRates));
        setLastUpdated(new Date(cachedTime));
      }
    }

    if (isOnline) {
      loadRates();
    }
  }, [isOnline]);

  // Сохранение в кэш
  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      localStorage.setItem('exchangeRates', JSON.stringify(rates));
      localStorage.setItem('exchangeRatesTime', new Date().toISOString());
    }
  }, [rates]);

  // Расчёт курса
  const calculateRate = () => {
    if (!rates[fromCurrency.code] || !rates[toCurrency.code]) return null;
    return rates[toCurrency.code] / rates[fromCurrency.code];
  };

  const inverseRate = calculateRate() ? 1 / calculateRate() : null;

  // Обмен валютами
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Ручное обновление
  const refreshRates = () => {
    if (refreshing) return;
    setRefreshing(true);
    loadRates();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Currency Converter</h1>
          <p className="text-gray-500">Get real-time exchange rates</p>
        </div>

        {/* Индикатор сети */}
        <div className="flex justify-center items-center gap-4 mb-6 text-sm">
          <div className={`flex items-center ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="text-gray-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}
          </div>
          {isOnline && (
            <button
              onClick={refreshRates}
              disabled={refreshing}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.356-2m15.356 2H15"
                />
              </svg>
              Refresh rates
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Amount</label>
              <InputWithDebounce value={amount} onChange={setAmount} placeholder="Enter amount" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <CurrencySelector
                  selectedCurrency={fromCurrency}
                  onSelect={setFromCurrency}
                  label="From"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18m-18 0H7m18 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m16 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <CurrencySelector
                  selectedCurrency={toCurrency}
                  onSelect={setToCurrency}
                  label="To"
                />
              </div>
            </div>
          </div>

          <ConversionResult
            amount={parseAmount(amount)}
            from={fromCurrency}
            to={toCurrency}
            rate={calculateRate()}
            inverseRate={inverseRate}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {!isOnline && lastUpdated && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Using cached rates from {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
