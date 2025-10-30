import axios, { AxiosInstance, AxiosError } from "axios";

interface MarketDataResponse {
  prices: Array<{
    timestamp: Date;
    price: number;
    volume?: number;
  }>;
}

class MarketApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (process.env.THIRD_PARTY_API_KEY) {
        config.headers["X-API-Key"] = process.env.THIRD_PARTY_API_KEY;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        console.error("Market API Error:", error.message);
        return Promise.reject(error);
      }
    );
  }

  async getMarketData(skinId: string): Promise<MarketDataResponse> {
    try {
      const response = await this.client.get(`/api/market/${skinId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market data:", error);
      throw error;
    }
  }

  async getPriceHistory(skinId: string, days: number = 30) {
    try {
      const response = await this.client.get(`/api/market/${skinId}/history`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching price history:", error);
      throw error;
    }
  }
}

export const marketClient = new MarketApiClient();
