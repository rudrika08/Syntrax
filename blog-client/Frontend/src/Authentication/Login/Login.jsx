import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './../../store/userSlice';
import { setTokens, getAccessToken } from '../../utils/authUtils';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async (token) => {
    try {
      const accessToken = token || getAccessToken();
      console.log('fetchUser with token:', accessToken);
      
      if (!accessToken) {
        console.error('No access token available');
        return;
      }
      
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Unauthorized: No token provided or invalid token');
      }

      const data = await response.json();
      dispatch(setUserDetails(data.user));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle Google Login Response
  const handleGoogleResponse = useCallback(async (response) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch(SummaryApi.googleAuth.url, {
        method: SummaryApi.googleAuth.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      // Store tokens
      const { accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);

      // Set user details from response
      if (data.data.user) {
        dispatch(setUserDetails(data.data.user));
      } else {
        await fetchUser(accessToken);
      }

      toast.success('Logged in with Google successfully!');
      navigate('/');
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Google authentication failed');
      setError(error.message || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [dispatch, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch(SummaryApi.login.url, {
        method: SummaryApi.login.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        toast.error(errorData.message || 'Something went wrong');
        return; 
      }
  
      const data = await response.json();
  
      const { accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
  
      toast.success('User logged in successfully');
      await fetchUser(accessToken);
      navigate('/');
  
    } catch (error) {
      setError('Network error. Please try again later.');
      toast.error('Network error. Please try again later.');
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="login-page">
    <div className="login-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Divider */}
      <div className="divider">
        <span>OR</span>
      </div>

      {/* Google Sign-In Button */}
      <div className="google-login-container">
        {isGoogleLoading ? (
          <div className="google-loading">Signing in with Google...</div>
        ) : (
          <div id="google-signin-button"></div>
        )}
      </div>

      <p className="signup-prompt">
        Don't have an account?{' '}
        <span
          className="signup-link"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </span>
      </p>
    </div>
  </div>
  );
};

export default Login;
