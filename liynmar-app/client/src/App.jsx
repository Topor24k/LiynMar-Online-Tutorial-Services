import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import Students from './pages/Students';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Employees from './pages/Employees';
import Auth from './pages/Auth';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Routes Component
const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Get default route based on user role
  const getDefaultRoute = () => {
    switch (user.role) {
      case 'admin':
        return '/dashboard';
      case 'teacher_manager':
        return '/teachers';
      case 'booking_manager':
        return '/bookings';
      default:
        return '/dashboard';
    }
  };

  // User is authenticated, show app
  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Header onMenuClick={toggleSidebar} onSearch={handleSearch} sidebarOpen={sidebarOpen} />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher_manager']}>
                  <Teachers searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teachers/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher_manager', 'booking_manager']}>
                  <TeacherProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'booking_manager', 'teacher_manager']}>
                  <Students searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'booking_manager', 'teacher_manager']}>
                  <Bookings searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Employees searchQuery={searchQuery} />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Auth Routes Component
const AuthRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate page based on role
  if (user) {
    const defaultRoute = user.role === 'teacher_manager' ? '/teachers' 
      : user.role === 'booking_manager' ? '/bookings' 
      : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Auth />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthRoutes />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
