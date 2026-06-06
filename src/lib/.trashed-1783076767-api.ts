export const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
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
  return fetch(input, init);
};
