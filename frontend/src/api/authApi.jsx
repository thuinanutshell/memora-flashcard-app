const BASE_URL = 'http://127.0.0.1:5001/auth';

export const register = async (userData) => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
    }
    
    return await response.json();
};

export const login = async (credentials) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
    }

    return await response.json();
};

export const logout = async (token) => {
    const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Logout failed');
    }
};

export const verifyToken = async (token) => {
    const response = await fetch(`${BASE_URL}/protected`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Token verification failed');
    }
    
    return await response.json();
};