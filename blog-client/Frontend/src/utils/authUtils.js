import SummaryApi from '../common';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Store tokens in localStorage
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Get access token from localStorage
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Clear all tokens from localStorage
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Also clear old 'token' key for backward compatibility
    localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getAccessToken();
};

// Refresh the access token using refresh token
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(SummaryApi.refreshToken.url, {
            method: SummaryApi.refreshToken.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            // Refresh token is invalid or expired, clear all tokens
            clearTokens();
            throw new Error(data.message || 'Failed to refresh token');
        }

        // Store new access token
        setTokens(data.data.accessToken, null);
        return data.data.accessToken;
    } catch (error) {
        clearTokens();
        throw error;
    }
};

// API call wrapper with automatic token refresh
export const apiCall = async (url, options = {}) => {
    const accessToken = getAccessToken();
    
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add authorization header if token exists
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Make the initial request
    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    // If token expired (401 with tokenExpired flag), try to refresh
    if (response.status === 401) {
        const errorData = await response.json();
        
        if (errorData.tokenExpired) {
            try {
                // Try to refresh the token
                const newAccessToken = await refreshAccessToken();
                
                // Retry the original request with new token
                headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: 'include'
                });
            } catch (refreshError) {
                // Refresh failed, redirect to login
                console.error('Token refresh failed:', refreshError);
                window.location.href = '/login';
                throw refreshError;
            }
        } else {
            // Not a token expiry issue, just unauthorized
            throw new Error(errorData.message || 'Unauthorized');
        }
    }

    return response;
};

// Helper function for GET requests
export const apiGet = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
};

// Helper function for POST requests
export const apiPost = (url, body, options = {}) => {
    return apiCall(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    });
};

// Helper function for PUT requests
export const apiPut = (url, body, options = {}) => {
    return apiCall(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
    });
};

// Helper function for DELETE requests
export const apiDelete = (url, body, options = {}) => {
    return apiCall(url, {
        ...options,
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined
    });
};
