import { apiRequest, setAuthToken } from './api';

/**
 * Log in with username and password.
 */
export async function loginUser(username, password) {
  const data = await apiRequest('login/', {
    method: 'POST',
    body: { username, password },
  });

  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Register a new user account.
 */
export async function registerUser({ username, email, password, confirmPassword }) {
  const data = await apiRequest('register/', {
    method: 'POST',
    body: {
      username,
      email: email || '',
      password,
      confirm_password: confirmPassword,
    },
  });

  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Log out and invalidate current token.
 */
export async function logoutUser() {
  try {
    await apiRequest('logout/', { method: 'POST' });
  } catch (err) {
    console.warn('Backend logout request failed, clearing local token anyway:', err);
  } finally {
    setAuthToken(null);
  }
}

/**
 * Fetch authenticated user profile details.
 */
export async function getCurrentUser() {
  return await apiRequest('me/', { method: 'GET' });
}
