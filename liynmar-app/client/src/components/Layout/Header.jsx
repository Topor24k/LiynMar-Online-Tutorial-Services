import React, { useState } from 'react';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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
          <input type="text" placeholder="Search teachers, bookings, subjects..." />
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
