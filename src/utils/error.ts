export interface NormalizedError {
  message: string;
  name: string;
  status?: number;
  statusText?: string;
  response?: any;
  stack?: string;
}

export function normalizeError(error: any): NormalizedError {
  return {
    message: error.message ?? 'Unknown error',
    name: error.name ?? 'Error',
    status: error.status,
    statusText: error.statusText,
    response: error.response,
    stack: error.stack,
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: any[],
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
