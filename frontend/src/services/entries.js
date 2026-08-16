import { apiRequest } from './api';

/**
 * Fetch journal entries for the authenticated user.
 * Supports optional date, month, and search query parameters.
 */
export async function getEntries(params = {}) {
  const query = new URLSearchParams();

  if (params.date) query.append('date', params.date);
  if (params.month) query.append('month', params.month);
  if (params.search) query.append('search', params.search);

  const queryString = query.toString();
  const endpoint = queryString ? `entries/?${queryString}` : 'entries/';

  return await apiRequest(endpoint, { method: 'GET' });
}

/**
 * Retrieve a specific entry by its ID.
 */
export async function getEntryById(id) {
  return await apiRequest(`entries/${id}/`, { method: 'GET' });
}

/**
 * Create a new daily gratitude entry.
 */
export async function createEntry({ title, date, content }) {
  return await apiRequest('entries/', {
    method: 'POST',
    body: { title: title || '', date, content },
  });
}

/**
 * Update an existing gratitude entry (PUT / PATCH).
 */
export async function updateEntry(id, { title, date, content }) {
  return await apiRequest(`entries/${id}/`, {
    method: 'PUT',
    body: { title: title || '', date, content },
  });
}


/**
 * Delete an entry by ID.
 */
export async function deleteEntry(id) {
  return await apiRequest(`entries/${id}/`, {
    method: 'DELETE',
  });
}
