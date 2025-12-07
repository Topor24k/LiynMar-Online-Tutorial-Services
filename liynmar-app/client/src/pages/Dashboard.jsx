import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import teacherService from '../services/teacherService';
import studentService from '../services/studentService';
import bookingService from '../services/bookingService';
import './Dashboard.css';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('week'); // week, month, year
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    teachers: [],
    students: [],
    bookings: [],
    sessions: []
  });

  // Load data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [teachersResponse, studentsResponse, bookingsResponse] = await Promise.all([
        teacherService.getAllTeachers(),
        studentService.getAllStudents(),
        bookingService.getAllBookings()
      ]);

      const teachers = teachersResponse.data || [];
      const students = studentsResponse.data || [];
      const bookings = bookingsResponse.data || [];

      setDashboardData({
        teachers: teachers.filter(t => !t.isDeleted),
        students: students.filter(s => !s.isDeleted),
        bookings,
        sessions: bookings // Using bookings as sessions for now
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate shares based on duration
  const calculateShares = (duration, totalRate) => {
    const durationStr = duration.toLowerCase();
    let hours = 0;
    
    if (durationStr.includes('30 min')) {
      hours = 0.5;
    } else if (durationStr.includes('1.5 hour')) {
      hours = 1.5;
    } else if (durationStr.includes('2 hour')) {
      hours = 2;
    } else if (durationStr.includes('1 hour')) {
      hours = 1;
    } else {
      const match = durationStr.match(/([\d.]+)/);
      hours = match ? parseFloat(match[1]) : 0;
    }
    
    const fullHours = Math.floor(hours);
    const remaining = hours - fullHours;
    const teacherShare = (fullHours * 100) + (remaining >= 0.5 ? 50 : 0);
    const companyShare = totalRate - teacherShare;
    
    return { teacherShare, companyShare };
  };

  // Calculate metrics based on real data
  const getMetrics = () => {
    const totalTeachers = dashboardData.teachers.length;
    const activeTeachers = dashboardData.teachers.filter(t => t.status === 'active').length;
    
    // Count students
    const bookedStudents = dashboardData.students.length;

    // Calculate sessions and revenue
    const sessions = dashboardData.bookings.length;
    let revenue = 0;
    
    dashboardData.bookings.forEach(booking => {
      if (booking.status === 'completed' || booking.status === 'active') {
        revenue += booking.totalEarningsPerWeek || 0;
      }
    });

    return {
      totalTeachers: activeTeachers,
      bookedStudents,
      sessions,
      revenue: Math.round(revenue),
      revenueChange: 0 // Can't calculate without historical data
    };
  };

  const metrics = getMetrics();

  // Revenue Graph Data - Using real booking data
  const revenueData = useMemo(() => {
    if (timePeriod === 'week') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const values = days.map(day => {
        // Sum earnings for bookings that have this day scheduled
        return dashboardData.bookings
          .filter(b => b.weeklySchedule && b.weeklySchedule[day])
          .reduce((sum, b) => sum + (b.totalEarningsPerWeek || 0) / 7, 0); // Divide weekly by 7 for daily
      });
      return { labels, values };
    } else if (timePeriod === 'month') {
      // Calculate weekly totals
      const weeklyTotal = dashboardData.bookings.reduce((sum, b) => 
        sum + (b.totalEarningsPerWeek || 0), 0
      );
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [weeklyTotal, weeklyTotal, weeklyTotal, weeklyTotal]
      };
    } else {
      // Calculate monthly totals (weekly * 4)
      const monthlyTotal = dashboardData.bookings.reduce((sum, b) => 
        sum + (b.totalEarningsPerWeek || 0), 0
      ) * 4;
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: Array(12).fill(monthlyTotal)
      };
    }
  }, [timePeriod, dashboardData.bookings]);

  // Session Status Data - Using real booking data
  const sessionData = useMemo(() => {
    const activeBookings = dashboardData.bookings.filter(b => b.status === 'active').length;
    const completedBookings = dashboardData.bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = dashboardData.bookings.filter(b => b.status === 'pending').length;
    
    return { 
      completed: completedBookings, 
      studentAbsent: pendingBookings, // Using pending as a proxy
      teacherAbsent: 0 
    };
  }, [dashboardData.bookings]);

  // Most Booked Subjects - Using real booking data
  const subjectData = useMemo(() => {
    const subjectCounts = {};
    
    dashboardData.bookings.forEach(booking => {
      const subject = booking.subjectFocus || 'Unknown';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });

    return Object.entries(subjectCounts)
      .map(([subject, bookings]) => ({ subject, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [dashboardData.bookings]);

  // Top 10 Teachers - Using real booking and earnings data
  const topTeachers = useMemo(() => {
    const teacherStats = {};

    // Calculate bookings and earnings per teacher
    dashboardData.bookings.forEach(booking => {
      const teacherId = booking.teacherId?._id || booking.teacherId;
      const teacher = dashboardData.teachers.find(t => t._id === teacherId);
      if (!teacher) return;

      if (!teacherStats[teacherId]) {
        teacherStats[teacherId] = {
          name: teacher.name,
          subject: teacher.majorSubject || teacher.subject,
          bookings: 0,
          earnings: 0
        };
      }

      teacherStats[teacherId].bookings += 1;
      
      // Calculate earnings from weekly schedule
      if (booking.status === 'active' || booking.status === 'completed') {
        teacherStats[teacherId].earnings += booking.totalEarningsPerWeek || 0;
      }
    });

    return Object.values(teacherStats)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10)
      .map((teacher, index) => ({
        rank: index + 1,
        ...teacher,
        earnings: Math.round(teacher.earnings)
      }));
  }, [dashboardData.bookings, dashboardData.teachers]);

  const maxRevenue = revenueData.values.length > 0 ? Math.max(...revenueData.values) : 1;
  const maxSubject = subjectData.length > 0 ? Math.max(...subjectData.map(s => s.bookings)) : 1;
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
            <span className="stat-change neutral">Company earnings</span>
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
            {revenueData.values.every(v => v === 0) ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-chart-line" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>No revenue data available yet. Start adding bookings!</p>
              </div>
            ) : (
              <div className="bar-chart">
                {revenueData.labels.map((label, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-wrapper">
                      <div 
                        className="bar"
                        style={{ 
                          height: `${maxRevenue > 0 ? (revenueData.values[index] / maxRevenue) * 100 : 0}%`,
                          backgroundColor: 'var(--color-primary)',
                          minHeight: revenueData.values[index] > 0 ? '20px' : '0'
                        }}
                        title={`₱${revenueData.values[index].toLocaleString()}`}
                      >
                        {revenueData.values[index] > 0 && (
                          <span className="bar-value">
                            ₱{revenueData.values[index] >= 1000 ? (revenueData.values[index] / 1000).toFixed(0) + 'k' : revenueData.values[index].toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
            )}
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
            {subjectData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-book" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>No subject data available yet. Start adding bookings!</p>
              </div>
            ) : (
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
            )}
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
            {topTeachers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                <i className="fas fa-trophy" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>No teacher data available yet. Start adding bookings!</p>
              </div>
            ) : (
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
                      <div className="teacher-subject">{teacher.majorSubject || teacher.subject}</div>
                    </div>
                    <div className="teacher-stats">
                      <div className="stat-item">
                        <i className="fas fa-calendar-check"></i>
                        <span>{teacher.bookings} bookings</span>
                      </div>
                      <div className="stat-item earnings">
                        <i className="fas fa-peso-sign"></i>
                        <span>{teacher.earnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
