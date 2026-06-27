// Helper de fetch para mutations: lança um Error enriquecido com `status` e
// `data` (corpo de erro) para a UI poder ramificar (ex.: 503 = IA não configurada).
export type RequestError = Error & { status?: number; data?: unknown };

export async function requestJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const code =
      typeof (data as { error?: unknown })?.error === "string"
        ? (data as { error: string }).error
        : "REQUEST_FAILED";
    throw Object.assign(new Error(code), {
      status: res.status,
      data,
    }) as RequestError;
  }
  return res.json() as Promise<T>;
}
