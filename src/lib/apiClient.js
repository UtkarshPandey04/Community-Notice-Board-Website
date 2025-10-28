// The base URL for the API.
// In development, this will be an empty string, and Vite's proxy will handle redirecting `/api` requests.
// In production, since frontend and backend are in the same Vercel project, use relative URLs.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * A wrapper around the Fetch API to automatically handle base URLs and headers.
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/posts').
 * @param {RequestInit} [options] - Optional fetch options (method, body, etc.).
 * @returns {Promise<any>} The JSON response from the API.
 */
async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }

  return response.json();
}

export default apiClient;