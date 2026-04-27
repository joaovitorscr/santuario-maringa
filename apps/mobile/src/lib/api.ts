import axios, { AxiosError, isAxiosError } from 'axios';

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  status: number;
  path: string;
  details?: string;

  constructor(message: string, status: number, path: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
    this.details = details;
  }
}

function getResponseMessage(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as { message?: unknown; error?: unknown };

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  return null;
}

function buildAxiosError(error: AxiosError, path: string) {
  if (error.response) {
    const message = getResponseMessage(error.response.data) ?? 'A API respondeu com erro.';
    const details = `HTTP ${error.response.status} em ${path}`;
    return new ApiError(`${message} (${details})`, error.response.status, path, details);
  }

  if (error.request) {
    const details = `Sem resposta da API em ${apiBaseUrl}${path}`;
    return new ApiError(
      `Nao foi possivel conectar com a API. Verifique se o backend esta rodando e se ${apiBaseUrl} esta acessivel pelo dispositivo. (${details})`,
      0,
      path,
      details,
    );
  }

  const details = error.message || `Falha ao montar a requisicao para ${path}`;
  return new ApiError(`Erro de requisicao. ${details}`, 0, path, details);
}

type ApiRequestConfig = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  data?: unknown;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(path: string, config?: ApiRequestConfig) {
  try {
    const response = await apiClient.request<T>({
      url: path,
      method: config?.method ?? 'GET',
      data: config?.data,
      headers: config?.headers,
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw buildAxiosError(error, path);
    }

    throw new ApiError('Falha inesperada ao comunicar com a API.', 0, path);
  }
}
