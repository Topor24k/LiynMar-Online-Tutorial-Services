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
      // Fetch only the data the user has access to based on their role
      const fetchPromises = [];
      
      // Teachers data - admin and teacher_manager can access
      fetchPromises.push(
        teacherService.getAllTeachers().catch(() => ({ data: [] }))
      );
      
      // Students data - admin and booking_manager can access
      fetchPromises.push(
        studentService.getAllStudents().catch(() => ({ data: [] }))
      );
      
      // Bookings data - admin and booking_manager can access
      fetchPromises.push(
        bookingService.getAllBookings().catch(() => ({ data: [] }))
      );

      const [teachersResponse, studentsResponse, bookingsResponse] = await Promise.all(fetchPromises);

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
  const calculateShares = (duration) => {
    const shareMap = {
      0.5: { teacher: 50, company: 13 },   // 30 mins
      1: { teacher: 100, company: 25 },    // 1 hour
      1.5: { teacher: 150, company: 38 },  // 1.5 hours
      2: { teacher: 200, company: 50 }     // 2 hours
    };
    
    const shares = shareMap[duration] || { teacher: 100, company: 25 };
    return { teacherShare: shares.teacher, companyShare: shares.company };
  };

  // Get rate for duration
  const getRateForDuration = (duration) => {
    const rates = {
      0.5: 63,   // 30 mins
      1: 125,    // 1 hour
      1.5: 188,  // 1.5 hours
      2: 250     // 2 hours
    };
    return rates[duration] || 125;
  };

  // Calculate metrics based on real session data
  const getMetrics = () => {
    const totalTeachers = dashboardData.teachers.length;
    const activeTeachers = dashboardData.teachers.filter(t => t.status === 'active').length;
    
    // Count unique students from bookings
    const uniqueStudents = new Set();
    dashboardData.bookings.forEach(booking => {
      if (booking.studentName) {
        uniqueStudents.add(`${booking.studentName}-${booking.parentFbName}`);
      }
    });

    // Calculate total sessions and revenue from sessionStatus
    let totalSessions = 0;
    let completedSessions = 0;
    let revenue = 0;
    let teacherRevenue = 0;
    
    dashboardData.bookings.forEach(booking => {
      if (!booking.sessionStatus || !booking.weeklySchedule) return;
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach(day => {
        const sessionStatus = booking.sessionStatus[day];
        const daySchedule = booking.weeklySchedule[day];
        
        // Check if this day is scheduled
        if (daySchedule && daySchedule.isScheduled) {
          const status = sessionStatus?.status || 'N';
          const duration = daySchedule.duration || 1;
          const rate = getRateForDuration(duration);
          const shares = calculateShares(duration);
          
          // Count all scheduled sessions
          if (status !== 'N') {
            totalSessions++;
          }
          
          // Count completed and paid sessions for revenue (C = Completed, A = Advance Paid)
          if (status === 'C' || status === 'A') {
            completedSessions++;
            revenue += shares.companyShare;
            teacherRevenue += shares.teacherShare;
          }
        }
      });
    });

    return {
      totalTeachers: activeTeachers,
      bookedStudents: uniqueStudents.size,
      sessions: totalSessions,
      completedSessions,
      revenue: Math.round(revenue),
      teacherRevenue: Math.round(teacherRevenue),
      revenueChange: 0 // Can't calculate without historical data
    };
  };

  const metrics = getMetrics();

  // Revenue Graph Data - Using real session data
  const revenueData = useMemo(() => {
    if (timePeriod === 'week') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      const values = days.map(day => {
        let dayRevenue = 0;
        
        dashboardData.bookings.forEach(booking => {
          if (!booking.sessionStatus || !booking.weeklySchedule) return;
          
          const sessionStatus = booking.sessionStatus[day];
          const daySchedule = booking.weeklySchedule[day];
          
          if (daySchedule && daySchedule.isScheduled) {
            const status = sessionStatus?.status || 'N';
            const duration = daySchedule.duration || 1;
            
            // Only count paid/completed sessions (C = Completed, A = Advance Paid)
            if (status === 'C' || status === 'A') {
              const shares = calculateShares(duration);
              dayRevenue += shares.companyShare;
            }
          }
        });
        
        return dayRevenue;
      });
      
      return { labels, values };
    } else if (timePeriod === 'month') {
      // Calculate weekly totals for 4 weeks
      const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      // Calculate weekly revenue
      let weeklyRevenue = 0;
      dashboardData.bookings.forEach(booking => {
        if (!booking.sessionStatus || !booking.weeklySchedule) return;
        
        days.forEach(day => {
          const sessionStatus = booking.sessionStatus[day];
          const daySchedule = booking.weeklySchedule[day];
          
          if (daySchedule && daySchedule.isScheduled) {
            const status = sessionStatus?.status || 'N';
            const duration = daySchedule.duration || 1;
            
            if (status === 'C' || status === 'A') {
              const shares = calculateShares(duration);
              weeklyRevenue += shares.companyShare;
            }
          }
        });
      });
      
      // Replicate for 4 weeks (in reality, you'd query by date ranges)
      return {
        labels: weekLabels,
        values: [weeklyRevenue, weeklyRevenue, weeklyRevenue, weeklyRevenue]
      };
    } else {
      // Calculate monthly totals for year
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      // Calculate weekly revenue then multiply by 4 for monthly
      let weeklyRevenue = 0;
      dashboardData.bookings.forEach(booking => {
        if (!booking.sessionStatus || !booking.weeklySchedule) return;
        
        days.forEach(day => {
          const sessionStatus = booking.sessionStatus[day];
          const daySchedule = booking.weeklySchedule[day];
          
          if (daySchedule && daySchedule.isScheduled) {
            const status = sessionStatus?.status || 'N';
            const duration = daySchedule.duration || 1;
            
            if (status === 'C' || status === 'A') {
              const shares = calculateShares(duration);
              weeklyRevenue += shares.companyShare;
            }
          }
        });
      });
      
      const monthlyRevenue = weeklyRevenue * 4; // 4 weeks per month
      
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: Array(12).fill(monthlyRevenue)
      };
    }
  }, [timePeriod, dashboardData.bookings]);

  // Session Status Data - Using real session status from bookings
  const sessionData = useMemo(() => {
    let completed = 0;      // C
    let advancePaid = 0;    // A
    let pending = 0;        // P
    let teacherAbsent = 0;  // T
    let studentAbsent = 0;  // S
    let teacherSubstitute = 0; // AT
    let studentSubstitute = 0; // AS
    
    dashboardData.bookings.forEach(booking => {
      if (!booking.sessionStatus || !booking.weeklySchedule) return;
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach(day => {
        const sessionStatus = booking.sessionStatus[day];
        const daySchedule = booking.weeklySchedule[day];
        
        // Only count scheduled sessions
        if (daySchedule && daySchedule.isScheduled) {
          const status = sessionStatus?.status || 'N';
          
          switch(status) {
            case 'C': completed++; break;
            case 'A': advancePaid++; break;
            case 'P': pending++; break;
            case 'T': teacherAbsent++; break;
            case 'S': studentAbsent++; break;
            case 'AT': teacherSubstitute++; break;
            case 'AS': studentSubstitute++; break;
          }
        }
      });
    });
    
    return { 
      completed,
      advancePaid,
      pending,
      studentAbsent: studentAbsent + studentSubstitute,
      teacherAbsent: teacherAbsent + teacherSubstitute
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

  // Top 10 Teachers - Using real session-based earnings data
  const topTeachers = useMemo(() => {
    const teacherStats = {};

    // Calculate bookings and earnings per teacher from actual sessions
    dashboardData.bookings.forEach(booking => {
      const teacherId = booking.teacherId?._id || booking.teacherId;
      const teacher = dashboardData.teachers.find(t => t._id === teacherId);
      if (!teacher) return;

      if (!teacherStats[teacherId]) {
        teacherStats[teacherId] = {
          name: teacher.name,
          subject: teacher.majorSubject || teacher.subject,
          bookings: 0,
          sessions: 0,
          earnings: 0
        };
      }

      // Count this booking
      teacherStats[teacherId].bookings += 1;
      
      // Calculate earnings from individual sessions
      if (booking.sessionStatus && booking.weeklySchedule) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
          const sessionStatus = booking.sessionStatus[day];
          const daySchedule = booking.weeklySchedule[day];
          
          if (daySchedule && daySchedule.isScheduled) {
            const status = sessionStatus?.status || 'N';
            const duration = daySchedule.duration || 1;
            
            // Count completed or advance paid sessions
            if (status === 'C' || status === 'A') {
              teacherStats[teacherId].sessions += 1;
              const shares = calculateShares(duration);
              teacherStats[teacherId].earnings += shares.teacherShare;
            }
          }
        });
      }
    });

    return Object.values(teacherStats)
      .sort((a, b) => b.sessions - a.sessions) // Sort by sessions completed
      .slice(0, 10)
      .map((teacher, index) => ({
        rank: index + 1,
        ...teacher,
        earnings: Math.round(teacher.earnings)
      }));
  }, [dashboardData.bookings, dashboardData.teachers]);

  const maxRevenue = revenueData.values.length > 0 ? Math.max(...revenueData.values) : 1;
  const maxSubject = subjectData.length > 0 ? Math.max(...subjectData.map(s => s.bookings)) : 1;
  const totalSessions = sessionData.completed + sessionData.advancePaid + sessionData.pending + sessionData.studentAbsent + sessionData.teacherAbsent;

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
            <p className="stat-label">Total Students</p>
            <span className="stat-change positive">Active learners</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(125, 155, 118, 0.1)' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--color-success)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{metrics.sessions}</h3>
            <p className="stat-label">Total Sessions</p>
            <span className="stat-change success">{metrics.completedSessions} completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
            <i className="fas fa-money-bill-wave" style={{ color: 'var(--color-warning)' }}></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">₱{metrics.revenue.toLocaleString()}</h3>
            <p className="stat-label">Company Revenue</p>
            <span className="stat-change neutral">From completed sessions</span>
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
                {/* Completed - Green */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#7d9b76" strokeWidth="40" 
                  strokeDasharray={`${totalSessions > 0 ? (sessionData.completed / totalSessions) * 502 : 0} 502`} 
                  transform="rotate(-90 100 100)" />
                {/* Advance Paid - Blue */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" strokeWidth="40" 
                  strokeDasharray={`${totalSessions > 0 ? (sessionData.advancePaid / totalSessions) * 502 : 0} 502`} 
                  strokeDashoffset={`-${totalSessions > 0 ? (sessionData.completed / totalSessions) * 502 : 0}`}
                  transform="rotate(-90 100 100)" />
                {/* Pending - Orange */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f39c12" strokeWidth="40" 
                  strokeDasharray={`${totalSessions > 0 ? (sessionData.pending / totalSessions) * 502 : 0} 502`} 
                  strokeDashoffset={`-${totalSessions > 0 ? ((sessionData.completed + sessionData.advancePaid) / totalSessions) * 502 : 0}`}
                  transform="rotate(-90 100 100)" />
                {/* Student Absent - Red */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e74c3c" strokeWidth="40" 
                  strokeDasharray={`${totalSessions > 0 ? (sessionData.studentAbsent / totalSessions) * 502 : 0} 502`} 
                  strokeDashoffset={`-${totalSessions > 0 ? ((sessionData.completed + sessionData.advancePaid + sessionData.pending) / totalSessions) * 502 : 0}`}
                  transform="rotate(-90 100 100)" />
                {/* Teacher Absent - Yellow */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e67e22" strokeWidth="40" 
                  strokeDasharray={`${totalSessions > 0 ? (sessionData.teacherAbsent / totalSessions) * 502 : 0} 502`} 
                  strokeDashoffset={`-${totalSessions > 0 ? ((sessionData.completed + sessionData.advancePaid + sessionData.pending + sessionData.studentAbsent) / totalSessions) * 502 : 0}`}
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
                <span className="legend-dot" style={{ backgroundColor: '#3498db' }}></span>
                <span className="legend-label">Advance Paid: {sessionData.advancePaid}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f39c12' }}></span>
                <span className="legend-label">Pending: {sessionData.pending}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#e74c3c' }}></span>
                <span className="legend-label">Student Absent: {sessionData.studentAbsent}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#e67e22' }}></span>
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
                        <span>{teacher.sessions} sessions</span>
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
