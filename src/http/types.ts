export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  headers?: Record<string, string>;
}

export interface RetryConfig {
  retries: number;
  retryDelay: (retryCount: number) => number;
  retryCondition?: (error: any) => boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError extends Error {
  status?: number;
  statusText?: string;
  response?: any;
  isRetryable: boolean;
}
