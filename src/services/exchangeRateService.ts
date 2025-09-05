import axios from 'axios';

interface ExchangeRatesResponse {
  base: string;
  rates: Record<string, number>;
  date: string;
}

const API_URL = 'https://api.fxratesapi.com/latest';

export const fetchExchangeRates = async (): Promise<ExchangeRatesResponse> => {
  try {
    const response = await axios.get<ExchangeRatesResponse>(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch exchange rates');
  }
};
