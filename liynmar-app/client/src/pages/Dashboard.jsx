import React, { useState, useMemo } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('week'); // week, month, year

  // Sample data - Replace with actual API calls
  const getMetrics = () => {
    const metrics = {
      week: {
        totalTeachers: 24,
        bookedStudents: 156,
        sessions: 89,
        revenue: 28500,
        revenueChange: 8,
      },
      month: {
        totalTeachers: 24,
        bookedStudents: 620,
        sessions: 356,
        revenue: 114000,
        revenueChange: 12,
      },
      year: {
        totalTeachers: 24,
        bookedStudents: 7440,
        sessions: 4272,
        revenue: 1368000,
        revenueChange: 24,
      }
    };
    return metrics[timePeriod];
  };

  const metrics = getMetrics();

  // Revenue Graph Data
  const revenueData = useMemo(() => {
    if (timePeriod === 'week') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [4200, 3800, 4500, 4100, 5200, 3700, 3000]
      };
    } else if (timePeriod === 'month') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [24000, 28000, 32000, 30000]
      };
    } else {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [95000, 98000, 105000, 110000, 115000, 118000, 120000, 125000, 118000, 122000, 130000, 132000]
      };
    }
  }, [timePeriod]);

  // Session Status Data
  const sessionData = {
    completed: 72,
    studentAbsent: 10,
    teacherAbsent: 7
  };

  // Most Booked Subjects
  const subjectData = [
    { subject: 'Mathematics', bookings: 245 },
    { subject: 'English', bookings: 198 },
    { subject: 'Physics', bookings: 176 },
    { subject: 'Chemistry', bookings: 154 },
    { subject: 'Biology', bookings: 132 }
  ];

  // Top 10 Teachers
  const topTeachers = [
    { rank: 1, name: 'Sarah Johnson', subject: 'Mathematics', bookings: 48, earnings: 6000 },
    { rank: 2, name: 'Emily Santos', subject: 'English', bookings: 45, earnings: 5625 },
    { rank: 3, name: 'Michael Chen', subject: 'Physics', bookings: 42, earnings: 5250 },
    { rank: 4, name: 'David Martinez', subject: 'Chemistry', bookings: 39, earnings: 4875 },
    { rank: 5, name: 'Lisa Wong', subject: 'Biology', bookings: 36, earnings: 4500 },
    { rank: 6, name: 'James Wilson', subject: 'Mathematics', bookings: 33, earnings: 4125 },
    { rank: 7, name: 'Maria Garcia', subject: 'English', bookings: 30, earnings: 3750 },
    { rank: 8, name: 'Robert Kim', subject: 'Physics', bookings: 28, earnings: 3500 },
    { rank: 9, name: 'Anna Lee', subject: 'Chemistry', bookings: 25, earnings: 3125 },
    { rank: 10, name: 'John Smith', subject: 'Biology', bookings: 23, earnings: 2875 }
  ];

  const maxRevenue = Math.max(...revenueData.values);
  const maxSubject = Math.max(...subjectData.map(s => s.bookings));
  const totalSessions = sessionData.completed + sessionData.studentAbsent + sessionData.teacherAbsent;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Welcome back, here's what's happening</p>
        </div>
        <div className="page-actions">
          <div className="period-selector">
            <button 
              className={`period-btn ${timePeriod === 'week' ? 'active' : ''}`}
              onClick={() => setTimePeriod('week')}
            >
              Week
            </button>
            <button 
              className={`period-btn ${timePeriod === 'month' ? 'active' : ''}`}
              onClick={() => setTimePeriod('month')}
            >
              Month
            </button>
            <button 
              className={`period-btn ${timePeriod === 'year' ? 'active' : ''}`}
              onClick={() => setTimePeriod('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
            <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{metrics.totalTeachers}</h3>
            <p className="stat-label">Total Teachers</p>
            <span className="stat-change neutral">Active instructors</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(201, 168, 105, 0.1)' }}>
            <i className="fas fa-users" style={{ color: 'var(--color-secondary)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{metrics.bookedStudents}</h3>
            <p className="stat-label">Total Booked Students ({timePeriod})</p>
            <span className="stat-change positive">Active learners</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(125, 155, 118, 0.1)' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--color-success)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{metrics.sessions}</h3>
            <p className="stat-label">Sessions This {timePeriod}</p>
            <span className="stat-change neutral">Total sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
            <i className="fas fa-money-bill-wave" style={{ color: 'var(--color-warning)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">₱{metrics.revenue.toLocaleString()}</h3>
            <p className="stat-label">Revenue This {timePeriod}</p>
            <span className="stat-change positive">+{metrics.revenueChange}% from last {timePeriod}</span>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="graphs-grid">
        {/* Revenue Trend Graph */}
        <div className="card graph-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-line"></i> Revenue Trend
            </h3>
            <span className="card-subtitle">Company revenue {timePeriod}ly overview</span>
          </div>
          <div className="card-body">
            <div className="bar-chart">
              {revenueData.labels.map((label, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar"
                      style={{ 
                        height: `${(revenueData.values[index] / maxRevenue) * 100}%`,
                        backgroundColor: 'var(--color-primary)'
                      }}
                      title={`₱${revenueData.values[index].toLocaleString()}`}
                    >
                      <span className="bar-value">₱{(revenueData.values[index] / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <span className="bar-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Status Graph */}
        <div className="card graph-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-pie"></i> Session Status
            </h3>
            <span className="card-subtitle">Session completion breakdown</span>
          </div>
          <div className="card-body">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#7d9b76" strokeWidth="40" 
                  strokeDasharray={`${(sessionData.completed / totalSessions) * 502} 502`} 
                  transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e74c3c" strokeWidth="40" 
                  strokeDasharray={`${(sessionData.studentAbsent / totalSessions) * 502} 502`} 
                  strokeDashoffset={`-${(sessionData.completed / totalSessions) * 502}`}
                  transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f39c12" strokeWidth="40" 
                  strokeDasharray={`${(sessionData.teacherAbsent / totalSessions) * 502} 502`} 
                  strokeDashoffset={`-${((sessionData.completed + sessionData.studentAbsent) / totalSessions) * 502}`}
                  transform="rotate(-90 100 100)" />
                <text x="100" y="100" textAnchor="middle" dy="7" className="donut-center-text">{totalSessions}</text>
                <text x="100" y="115" textAnchor="middle" dy="7" className="donut-center-label">Total</text>
              </svg>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#7d9b76' }}></span>
                <span className="legend-label">Completed: {sessionData.completed}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#e74c3c' }}></span>
                <span className="legend-label">Student Absent: {sessionData.studentAbsent}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f39c12' }}></span>
                <span className="legend-label">Teacher Absent: {sessionData.teacherAbsent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Booked Subjects */}
        <div className="card graph-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-book"></i> Most Booked Subjects
            </h3>
            <span className="card-subtitle">Top subjects by booking count</span>
          </div>
          <div className="card-body">
            <div className="horizontal-bar-chart">
              {subjectData.map((item, index) => (
                <div key={index} className="h-bar-item">
                  <div className="h-bar-label">{item.subject}</div>
                  <div className="h-bar-wrapper">
                    <div 
                      className="h-bar"
                      style={{ 
                        width: `${(item.bookings / maxSubject) * 100}%`,
                        backgroundColor: `hsl(${30 + index * 20}, 60%, 55%)`
                      }}
                    >
                      <span className="h-bar-value">{item.bookings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Teachers */}
        <div className="card graph-card top-teachers-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-trophy"></i> Top 10 Teachers
            </h3>
            <span className="card-subtitle">Most booked teachers this {timePeriod}</span>
          </div>
          <div className="card-body">
            <div className="top-teachers-list">
              {topTeachers.map((teacher) => (
                <div key={teacher.rank} className={`top-teacher-item ${teacher.rank <= 3 ? 'podium' : ''}`}>
                  <div className="teacher-rank">
                    {teacher.rank <= 3 ? (
                      <i className={`fas fa-medal rank-${teacher.rank}`}></i>
                    ) : (
                      <span className="rank-number">#{teacher.rank}</span>
                    )}
                  </div>
                  <div className="teacher-info">
                    <div className="teacher-name">{teacher.name}</div>
                    <div className="teacher-subject">{teacher.subject}</div>
                  </div>
                  <div className="teacher-stats">
                    <div className="stat-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>{teacher.bookings} bookings</span>
                    </div>
                    <div className="stat-item earnings">
                      <i className="fas fa-peso-sign"></i>
                      <span>₱{teacher.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
