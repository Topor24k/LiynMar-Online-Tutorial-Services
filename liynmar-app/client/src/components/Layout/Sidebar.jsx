import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const navItems = [
    { path: '/dashboard', icon: 'fa-home', label: 'Dashboard' },
    { path: '/teachers', icon: 'fa-chalkboard-teacher', label: 'Teachers' },
    { path: '/bookings', icon: 'fa-calendar-check', label: 'Bookings' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { path: '/settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-graduation-cap"></i>
          {isOpen && <span className="logo-text">LIYNMAR</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info-compact">
          <i className="fas fa-user-shield"></i>
          {isOpen && <span className="user-role">Administrator</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
