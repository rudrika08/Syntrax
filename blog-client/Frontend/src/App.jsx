import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import SummaryApi from './common';
import Navbar from './layouts/Navbar/Nav';
import Footer from './layouts/Footer/Footer';
import './App.css';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './helper/AuthContext';
import { getAccessToken, refreshAccessToken, clearTokens } from './utils/authUtils';

const App = () => {
  const dispatch = useDispatch();
  const fetchUser = async () => {
    try {
      let token = getAccessToken();
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        // Try to refresh the token
        try {
          token = await refreshAccessToken();
          // Retry with new token
          const retryResponse = await fetch(SummaryApi.current_user.url, {
            method: SummaryApi.current_user.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            dispatch(setUserDetails(retryData.user));
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          clearTokens();
          dispatch(setUserDetails(null));
          return;
        }
      }

      const data = await response.json();
      dispatch(setUserDetails(data.user));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <AuthProvider>
      <ToastContainer />
      <Navbar />
      <Outlet /> 
      <Footer />
      </AuthProvider>
    </>
  );
};

export default App;
