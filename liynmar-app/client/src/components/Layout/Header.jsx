import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onMenuClick, onSearch }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

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

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="company-name">LIYNMAR</h1>
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
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">0</span>
        </div>

        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="profile-info">
            <span className="user-name">Admin User</span>
            <span className="user-role-text">Administrator</span>
          </div>
          <div className="profile-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Admin+User&background=8B7355&color=fff"
              alt="Profile"
            />
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=8B7355&color=fff"
                  alt="Profile"
                />
                <div>
                  <p className="dropdown-name">Admin User</p>
                  <p className="dropdown-email">admin@liynmar.com</p>
                </div>
              </div>
              <div className="dropdown-menu">
                <a href="#">
                  <i className="fas fa-user"></i> My Profile
                </a>
                <a href="#">
                  <i className="fas fa-cog"></i> Settings
                </a>
                <a href="#">
                  <i className="fas fa-question-circle"></i> Help & Support
                </a>
                <hr />
                <a href="#" className="logout">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
