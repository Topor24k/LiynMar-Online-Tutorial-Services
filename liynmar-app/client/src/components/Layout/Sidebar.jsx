import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();

  // Define navigation items with role-based access
  const navItems = [
    { 
      path: '/dashboard', 
      icon: 'fa-home', 
      label: 'Dashboard',
      allowedRoles: ['admin']
    },
    { 
      path: '/teachers', 
      icon: 'fa-chalkboard-teacher', 
      label: 'Teachers',
      allowedRoles: ['admin', 'teacher_manager', 'booking_manager']
    },
    { 
      path: '/students', 
      icon: 'fa-user-graduate', 
      label: 'Students',
      allowedRoles: ['admin', 'booking_manager', 'teacher_manager']
    },
    { 
      path: '/bookings', 
      icon: 'fa-calendar-check', 
      label: 'Bookings',
      allowedRoles: ['admin', 'booking_manager', 'teacher_manager']
    },
    { 
      path: '/employees', 
      icon: 'fa-users-cog', 
      label: 'Employees',
      allowedRoles: ['admin']
    },
  ];

  // Filter navigation items based on user role
  const accessibleNavItems = navItems.filter(item => 
    item.allowedRoles.includes(user?.role)
  );

  const getUserRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'teacher_manager':
        return 'Teacher Manager';
      case 'booking_manager':
        return 'Booking Manager';
      default:
        return 'User';
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo" onClick={onToggle}>
          <i className="fas fa-graduation-cap"></i>
          {isOpen && <span className="logo-text">LIYNMAR</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {accessibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className={`fas ${item.icon}`}></i>
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info-compact">
          <i className="fas fa-user-shield"></i>
          {isOpen && <span className="user-role">{getUserRoleLabel()}</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
