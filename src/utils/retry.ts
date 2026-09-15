import { RateLimitError } from "../errors/index.js";
import { logger } from "./logging.js";

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;

  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt >= maxRetries;
      if (!(error instanceof RateLimitError) || isLastAttempt) {
        throw error;
      }

      const backoffMs = baseDelayMs * 2 ** attempt; 
      const jitterMs = Math.random() * baseDelayMs;
      const waitMs = (error.retryAfterSeconds ? error.retryAfterSeconds * 1000 : backoffMs) + jitterMs;

      attempt += 1;
      logger.warn(`Rate limit alcanzado. Reintentando (${attempt}/${maxRetries}) en ${Math.round(waitMs)}ms`);
      await sleep(waitMs);
    }
  }
}
