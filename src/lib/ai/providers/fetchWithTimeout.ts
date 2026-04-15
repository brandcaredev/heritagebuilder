export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs: number },
): Promise<Response> => {
  const { timeoutMs, signal, ...rest } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...rest,
      signal: signal ?? controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

