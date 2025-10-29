import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClientConfig, HttpError, HttpResponse } from './types';
import { normalizeError } from '@/utils/error';
import { Logger } from '@/logger';

export class HttpClient {
  private readonly axios: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly maxRetryDelay: number;
  private readonly logger: Logger;

  constructor(config: HttpClientConfig, logger: Logger) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 8000,
      headers: config.headers,
    });

    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 250;
    this.maxRetryDelay = config.maxRetryDelay ?? 4000;
    this.logger = logger;
  }

  async request<T>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    let attempt = 0;
    let lastError: AxiosError | null = null;

    while (attempt <= this.maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.axios.request<T>(config);
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = axiosError;
        const isRetryable = this.isRetryable(axiosError);
        const httpError = this.toHttpError(axiosError, isRetryable);

        if (!isRetryable || attempt === this.maxRetries) {
          this.logger.error('HttpClient request failed', {
            attempt,
            url: config.url,
            method: config.method,
            error: normalizeError(httpError),
          });
          throw httpError;
        }

        const backoffDelay = this.calculateBackoff(attempt);
        this.logger.warn('HttpClient retrying request', {
          attempt,
          url: config.url,
          method: config.method,
          delay: backoffDelay,
        });

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        attempt += 1;
      }
    }

    throw this.toHttpError(lastError as AxiosError, false);
  }

  private calculateBackoff(attempt: number): number {
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt);
    return Math.min(exponentialDelay, this.maxRetryDelay);
  }

  private isRetryable(error: AxiosError): boolean {
    if (error.response) {
      const status = error.response.status;
      return status === 429 || status >= 500;
    }
    return !!error.code;
  }

  private toHttpError(error: AxiosError, isRetryable: boolean): HttpError {
    const httpError = new Error(error.message) as HttpError;
    httpError.name = 'HttpError';
    httpError.status = error.response?.status;
    httpError.statusText = error.response?.statusText;
    httpError.response = error.response?.data;
    httpError.isRetryable = isRetryable;
    return httpError;
  }
}
