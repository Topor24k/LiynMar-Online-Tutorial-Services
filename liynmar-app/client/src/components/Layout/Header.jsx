import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLocalStorage } from '../../utils/helpers';
import './Header.css';

const Header = ({ onMenuClick, onSearch, sidebarOpen = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Get current user
  const currentUser = getLocalStorage('currentUser', {});
  const userName = currentUser.fullName || 'User';
  const userRole = currentUser.role || 'Employee';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const getSearchPlaceholder = () => {
    const path = location.pathname;
    if (path.includes('/teachers')) return 'Search teachers by name, subject, days...';
    if (path.includes('/bookings')) return 'Search teachers by name, subject, time, days...';
    if (path.includes('/subjects')) return 'Search subjects...';
    if (path.includes('/salary')) return 'Search by teacher name, month...';
    if (path.includes('/schedule')) return 'Search schedules...';
    return 'Search...';
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      window.location.href = '/auth';
    }
  };

  return (
    <header className={`top-header ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <div className="header-left">
        <button className="mobile-toggle" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={clearSearch}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="user-info" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef}>
          <div className="user-text">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
          <i className="fas fa-chevron-down dropdown-icon"></i>

          {showDropdown && (
            <div className="user-dropdown">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile'); setShowDropdown(false); }}>
                <i className="fas fa-user"></i> My Profile
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/help'); setShowDropdown(false); }}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
              <hr />
              <a href="#" className="logout-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
