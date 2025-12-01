import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Welcome back, here's what's happening today</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
            <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">24</h3>
            <p className="stat-label">Total Teachers</p>
            <span className="stat-change positive">+3 this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(201, 168, 105, 0.1)' }}>
            <i className="fas fa-users" style={{ color: 'var(--color-secondary)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">156</h3>
            <p className="stat-label">Active Students</p>
            <span className="stat-change positive">+12 this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(125, 155, 118, 0.1)' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--color-success)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">89</h3>
            <p className="stat-label">Sessions This Week</p>
            <span className="stat-change neutral">Same as last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
            <i className="fas fa-money-bill-wave" style={{ color: 'var(--color-warning)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">₱28,500</h3>
            <p className="stat-label">Revenue This Week</p>
            <span className="stat-change positive">+8% from last week</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Bookings</h3>
            <a href="/bookings" className="view-all-link">View All</a>
          </div>
          <div className="card-body">
            <p className="text-muted">Recent booking data will appear here</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Teachers</h3>
            <a href="/teachers" className="view-all-link">View All</a>
          </div>
          <div className="card-body">
            <p className="text-muted">Top performing teachers will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
