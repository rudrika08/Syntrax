import React, { useState, useEffect, useRef, useReducer } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserDetails } from './../../store/userSlice';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import { clearTokens, getAccessToken } from '../../utils/authUtils';
import './Nav.css';

const Navbar = () => {
  const user = useSelector(state => state?.user?.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showNavbar, setShowNavbar] = useState(true);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  let lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    forceUpdate();
  }, [user]);

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(SummaryApi.logout.url, {
        method: SummaryApi.logout.method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Clear tokens from localStorage
      clearTokens();
      
      toast.success(data.message);
      dispatch(setUserDetails(null));
      navigate('/login');
    } catch (error) {
      // Even if server logout fails, clear local tokens
      clearTokens();
      dispatch(setUserDetails(null));
      toast.error(error.message || 'Logged out');
      navigate('/login');
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!user) return;
    setDropdownOpen(prev => !prev);
  };

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    document.documentElement.classList.toggle('light-theme');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !dropdownRef.current?.contains(e.target) && !avatarRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${showNavbar ? 'visible' : 'hidden'}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <span>Syntrax</span>
            <div className="brand-dot" />
          </Link>
        </div>

        <div className="desktop-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/blog" className={`nav-link ${location.pathname === '/blog' ? 'active' : ''}`}>Blogs</Link>
          {user ? (
            <Link to="/blogCreate" className="nav-link">Create Blog</Link>
          ) : (
            <Link to="/login" className="nav-link">Create Blog</Link>
          )}
        </div>


        {user ? (
          <div className="navbar-user">
            <div className="user-avatar" ref={avatarRef} onClick={toggleDropdown}>
              {user?.profilePic ? (
                <img src={user.profilePic} alt="User" />
              ) : (
                <span>{user?.email?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}</span>
              )}
              <span className="avatar-status" />
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu" ref={dropdownRef}>
                <Link className="dropdown-item profile-link" to="/admin">Profile</Link>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="auth-button login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="auth-button signup" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>

        )}
      </div>
    </nav>
  );
};

export default Navbar;
