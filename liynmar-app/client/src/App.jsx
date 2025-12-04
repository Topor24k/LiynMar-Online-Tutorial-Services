import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Page Components
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('currentUser') !== null;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  // If not authenticated, show only auth page
  if (!isAuthenticated) {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <Header onMenuClick={toggleSidebar} onSearch={handleSearch} sidebarOpen={sidebarOpen} onLogout={handleLogout} />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard searchQuery={searchQuery} />} />
              <Route path="/teachers" element={<Teachers searchQuery={searchQuery} />} />
              <Route path="/teachers/:id" element={<TeacherProfile />} />
              <Route path="/bookings" element={<Bookings searchQuery={searchQuery} />} />
              <Route path="/analytics" element={<Analytics searchQuery={searchQuery} />} />
              <Route path="/settings" element={<Settings searchQuery={searchQuery} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AuthProvider>
  );
}

export default App;
