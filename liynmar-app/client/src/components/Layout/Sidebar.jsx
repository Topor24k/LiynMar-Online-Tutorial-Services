import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('🔍 Sidebar - User object:', user);
  console.log('🔍 Sidebar - User role:', user?.role);

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
      allowedRoles: ['admin', 'teacher_manager']
    },
    { 
      path: '/students', 
      icon: 'fa-user-graduate', 
      label: 'Students',
      allowedRoles: ['admin', 'booking_manager']
    },
    { 
      path: '/bookings', 
      icon: 'fa-calendar-check', 
      label: 'Bookings',
      allowedRoles: ['admin', 'booking_manager']
    },
    { 
      path: '/employees', 
      icon: 'fa-users-cog', 
      label: 'Employees',
      allowedRoles: ['admin']
    },
  ];

  const canAccess = (allowedRoles) => {
    const hasAccess = allowedRoles.includes(user?.role);
    console.log(`🔐 Checking access - Allowed: [${allowedRoles}], User role: ${user?.role}, Has access: ${hasAccess}`);
    return hasAccess;
  };

  const handleNavClick = (e, item) => {
    if (!canAccess(item.allowedRoles)) {
      e.preventDefault();
      toast.error(`Access denied. Only ${getRoleLabel(item.allowedRoles)} can access this section.`);
    }
  };

  const getRoleLabel = (roles) => {
    if (roles.includes('admin') && roles.length === 1) return 'Administrators';
    if (roles.includes('teacher_manager')) return 'Teacher Managers';
    if (roles.includes('booking_manager')) return 'Booking Managers';
    return 'authorized users';
  };

  const getUserRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin (Owner)';
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
        {navItems.map((item) => {
          const hasAccess = canAccess(item.allowedRoles);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!hasAccess ? 'locked' : ''}`
              }
              onClick={(e) => handleNavClick(e, item)}
            >
              <i className={`fas ${item.icon}`}></i>
              {isOpen && <span>{item.label}</span>}
              {!hasAccess && isOpen && <i className="fas fa-lock lock-icon"></i>}
            </NavLink>
          );
        })}
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
