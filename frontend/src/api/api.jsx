export const fetchWithAuth = async (url, options={}, token) => {
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    return fetch (url, { ...options, headers });
}