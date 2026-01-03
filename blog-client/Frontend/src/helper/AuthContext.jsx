import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    setTokens, 
    clearTokens, 
    getAccessToken, 
    getRefreshToken,
    isAuthenticated as checkAuth 
} from '../utils/authUtils';

const AuthContext = createContext(); // Create the context

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = () => {
            const hasToken = checkAuth();
            setIsLoggedIn(hasToken);
        };
        checkAuthStatus();
    }, []);

    const login = (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        setIsLoggedIn(true);
    };

    const logout = () => {
        clearTokens();
        setIsLoggedIn(false);
    };

    // Get current access token
    const getToken = () => {
        return getAccessToken();
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            login, 
            logout, 
            getToken,
            isAuthenticated: checkAuth 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
