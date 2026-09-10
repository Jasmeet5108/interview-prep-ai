const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      const status = error?.status;

      const retryable =
        status === 429 ||
        status === 413 ||
        status === 500 ||
        status === 502 ||
        status === 503;

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const retryAfter = Number(error?.headers?.get?.("retry-after")) || 0;

      const exponentialDelay = 1000 * Math.pow(2, attempt - 1);

      const delay = retryAfter > 0 ? retryAfter * 1000 : exponentialDelay;

      console.warn(`LLM request failed (${status}). Retrying in ${delay}ms...`);

      await sleep(delay);
    }
  }

  throw lastError;
}
