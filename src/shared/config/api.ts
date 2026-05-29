const DEFAULT_API_BASE_URL = '/api';

const normalizeBaseUrl = (rawUrl: string | undefined): string => {
  const trimmedUrl = rawUrl?.trim().replace(/\/+$/, '');

  if (!trimmedUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL);

export const API_HOST = API_BASE_URL.replace(/\/api$/, '');
