const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('ivy_token') : null;
  
  const getHeaders = (currentToken: string | null) => ({
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY!,
    ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
    ...options.headers,
  });

  const url = new URL(`${BASE_URL}${endpoint}`);
  let response = await fetch(url.toString(), { ...options, headers: getHeaders(token) });
  
  // Intercept 401 Unauthorized to trigger the undocumented Refresh Flow
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('ivy_refresh_token') : null;
    
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY! },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          token = refreshData.access_token || refreshData.token;
          const newRefreshToken = refreshData.refresh_token;

          localStorage.setItem('ivy_token', token!);
          if (newRefreshToken) localStorage.setItem('ivy_refresh_token', newRefreshToken);

          // Retry original request with new token
          response = await fetch(url.toString(), { ...options, headers: getHeaders(token) });
        } else {
          // Refresh failed, force logout
          localStorage.removeItem('ivy_token');
          localStorage.removeItem('ivy_refresh_token');
          localStorage.removeItem('ivy_user');
          if (typeof window !== 'undefined') window.location.href = '/';
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}