// An external API lets the GitHub Pages frontend use the full AI service.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true' && !API_BASE_URL;

export const getApiUrl = (pathname: string) => `${API_BASE_URL}${pathname}`;
