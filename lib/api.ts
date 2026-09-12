const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ivy_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY!, // Header added here
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = new URL(`${BASE_URL}${endpoint}`);
  // Removed the url.searchParams.append line from here

  const response = await fetch(url.toString(), { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}