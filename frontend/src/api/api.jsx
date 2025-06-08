const API_BASE_URL = 'http://127.0.0.1:5001';

export const fetchWithAuth = async (endpoint, options = {}, token) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Ensure headers are properly capitalized (some servers are case-sensitive)
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  // Remove duplicate headers from options
  const { headers: _, ...restOptions } = options;
  
  const config = {
    ...restOptions,
    headers,
    credentials: 'include' // Important for cookies/CORS if using them
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 specifically to provide better error messages
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authentication failed. Please login again.');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', {
      endpoint,
      error: error.message,
      tokenPresent: !!token
    });
    throw error;
  }
};