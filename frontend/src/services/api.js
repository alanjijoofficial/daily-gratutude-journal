/**
 * API Client & Network helper for Daily Gratitude Journal.
 * Automatically injects authentication tokens and extracts structured errors.
 */

let rawApiUrl = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL.trim() 
  : 'http://127.0.0.1:8000/api';

// Normalize URL: Ensure it ends with /api (without trailing slash)
rawApiUrl = rawApiUrl.replace(/\/+$/, '');
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}

const API_BASE_URL = rawApiUrl;



/**
 * Retrieves the stored auth token.
 */
export function getAuthToken() {
  return localStorage.getItem('gratitude_token');
}

/**
 * Saves the auth token.
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('gratitude_token', token);
  } else {
    localStorage.removeItem('gratitude_token');
  }
}

/**
 * Core fetch wrapper with error handling and auth headers.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Parse Django/DRF error structure into friendly string
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors;
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMessage = Array.isArray(val) ? `${firstKey}: ${val.join(' ')}` : `${firstKey}: ${val}`;
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to reach the backend server. If using Render free tier, the service is waking up from sleep (takes ~45s) — please try again in a moment.');
    }
    throw err;
  }

}
