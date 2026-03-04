type SafeFetchOptions = RequestInit & {
  retries?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
};

type SafeFetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status: number, retryOnStatuses: number[]): boolean {
  return retryOnStatuses.includes(status) || status >= 500;
}

export async function safeFetchJson<T>(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchJsonResult<T>> {
  const {
    retries = 2,
    timeoutMs = 6000,
    retryDelayMs = 300,
    retryOnStatuses = [408, 425, 429],
    ...requestInit
  } = options;

  let attempt = 0;
  let lastStatus = 0;
  let lastError = "unknown error";

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      lastStatus = response.status;

      if (!response.ok && attempt < retries && shouldRetryStatus(response.status, retryOnStatuses)) {
        attempt += 1;
        await sleep(retryDelayMs * attempt);
        continue;
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data: null,
          error: `HTTP ${response.status}`,
        };
      }

      const payload = (await response.json().catch(() => null)) as T | null;
      return { ok: true, status: response.status, data: payload };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt >= retries) {
        break;
      }
      attempt += 1;
      await sleep(retryDelayMs * attempt);
    }
  }

  return {
    ok: false,
    status: lastStatus || 0,
    data: null,
    error: lastError,
  };
}
