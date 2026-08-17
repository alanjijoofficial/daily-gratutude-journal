/**
 * API Client & Network helper for Daily Gratitude Journal.
 * Automatically injects authentication tokens and extracts structured errors.
 */

const API_BASE_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : 'https://daily-gratutude-journal-git-main-alan-jijo.vercel.app/api';


/**
 * Retrieves the stored auth token.
 */
export function getAuthToken() {
  try {
    return localStorage.getItem('gratitude_token');
  } catch (e) {
    return null;
  }
}

/**
 * Saves the auth token.
 */
export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('gratitude_token', token);
    } else {
      localStorage.removeItem('gratitude_token');
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
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
      throw new Error('Unable to connect to the backend server. Please verify Django is running.');
    }
    throw err;
  }
}
