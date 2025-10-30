import axios, { AxiosInstance, AxiosError } from "axios";

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

class SteamApiClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.steampowered.com",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as { retry?: number } & typeof error.config;

        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry < this.retryConfig.maxRetries) {
          config.retry += 1;

          const delay =
            this.retryConfig.retryDelay *
            Math.pow(this.retryConfig.backoffMultiplier, config.retry - 1);

          await new Promise((resolve) => setTimeout(resolve, delay));

          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  async getMarketPrices(appId: number = 730) {
    try {
      const response = await this.client.get(
        `/ISteamEconomy/GetAssetPrices/v1/`,
        {
          params: {
            key: process.env.STEAM_API_KEY,
            appid: appId,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching Steam market prices:", error);
      throw error;
    }
  }

  async getItemDetails(appId: number, marketHashName: string) {
    try {
      const response = await this.client.get(
        `/ISteamEconomy/GetAssetClassInfo/v1/`,
        {
          params: {
            key: process.env.STEAM_API_KEY,
            appid: appId,
            class_count: 1,
            classid0: marketHashName,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
  }

  async getUserInventory(steamId: string, appId: number = 730) {
    try {
      const response = await this.client.get(
        `/IEconItems_${appId}/GetPlayerItems/v1/`,
        {
          params: {
            key: process.env.STEAM_API_KEY,
            steamid: steamId,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching user inventory:", error);
      throw error;
    }
  }
}

export const steamClient = new SteamApiClient();
