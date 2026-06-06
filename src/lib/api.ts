import { showToast } from '../components/Toast';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  if (url.startsWith('/api/')) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      init.headers = {
        ...init.headers,
        'x-user-email': email
      };
    }
  }

  const maxRetries = 3;
  let delay = 500; // start with 500ms delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);

      // If response is successful or a client error (status < 500), return immediately
      if (response.status < 500) {
        return response;
      }

      // If it's a 5xx server error, retry unless we hit maxRetries
      if (attempt < maxRetries) {
        console.warn(`Request failed with status ${response.status}. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        delay *= 2;
        continue;
      }

      // Final attempt failed with a 5xx error, trigger toast
      showToast('Service Temporarily Unavailable');
      return response;
    } catch (error) {
      // Network error (fetch threw)
      if (attempt < maxRetries) {
        console.warn(`Request encountered a network error. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`, error);
        await sleep(delay);
        delay *= 2;
        continue;
      }

      // Ultimate failure on network error, trigger toast and rethrow
      showToast('Service Temporarily Unavailable');
      throw error;
    }
  }

  throw new Error('Request failed after max retries');
};
