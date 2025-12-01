import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { teacherService } from '../services/teacherService';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teacher } = useQuery(['teacher', id], () => teacherService.getById(id));

  // Sample data
  const sampleTeacher = {
    _id: id,
    name: 'Sarah Johnson',
    subject: 'Mathematics',
    email: 'sarah.johnson@liynmar.com',
    phone: '+63 912 345 6789',
    facebook: 'facebook.com/sarahjohnson',
    major: 'Mathematics Education',
    experience: '3 years in online tutoring, specialized in Algebra and Calculus',
    daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    usualTime: '2:00 PM - 8:00 PM',
    status: 'available',
    rating: 4.9,
    students: [
      {
        name: 'Alex Rodriguez',
        parent: 'Maria Rodriguez',
        gradeLevel: 'Grade 10',
        subject: 'Algebra',
        time: '3:00 PM',
        duration: '1 hour',
        days: ['Wednesday'],
        sessions: {
          monday: null,
          tuesday: null,
          wednesday: 'completed-paid',
          thursday: null,
          friday: null,
          saturday: null,
        },
        totalEarned: 100,
      },
    ],
  };

  const teacherData = teacher || sampleTeacher;

  const getStatusIcon = (status) => {
    if (!status) return <span className="status-icon not-scheduled">-</span>;

    const icons = {
      'completed-paid': <span className="status-icon completed-paid" title="Completed & Paid - ₱100 earned">✓</span>,
      'advance-paid': <span className="status-icon advance-paid" title="Advance Paid">A</span>,
      'pending-unpaid': <span className="status-icon pending-unpaid" title="Pending (Unpaid)">○</span>,
      'teacher-absent': <span className="status-icon teacher-absent" title="Teacher Absent">T</span>,
      'student-absent': <span className="status-icon student-absent" title="Student Absent">S</span>,
    };

    return icons[status] || <span className="status-icon not-scheduled">-</span>;
  };

  const calculateSummary = () => {
    const totalSessions = teacherData.students.reduce((sum, student) => {
      return sum + Object.values(student.sessions).filter(s => s).length;
    }, 0);

    const paidSessions = teacherData.students.reduce((sum, student) => {
      return sum + Object.values(student.sessions).filter(s => s === 'completed-paid' || s === 'advance-paid').length;
    }, 0);

    const pendingSessions = teacherData.students.reduce((sum, student) => {
      return sum + Object.values(student.sessions).filter(s => s === 'pending-unpaid').length;
    }, 0);

    const totalEarned = teacherData.students.reduce((sum, student) => sum + student.totalEarned, 0);

    return { totalSessions, paidSessions, pendingSessions, totalEarned };
  };

  const summary = calculateSummary();

  return (
    <div className="teacher-profile-page">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/teachers')}>
            <i className="fas fa-arrow-left"></i> Back to Teachers
          </button>
        </div>
        <div className="page-actions">
          <button className="btn-secondary">
            <i className="fas fa-edit"></i> Edit Profile
          </button>
        </div>
      </div>

      {/* Teacher Profile Card */}
      <div className="card teacher-profile">
        <div className="profile-header">
          <div className="profile-avatar-large">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData.name)}&background=8B7355&color=fff`}
              alt={teacherData.name}
            />
          </div>
          <div className="profile-info-main">
            <h2>{teacherData.name}</h2>
            <p className="profile-subject">{teacherData.subject} Teacher</p>
            <div className="profile-meta">
              <div className="profile-rating">
                <i className="fas fa-star"></i>
                <span>{teacherData.rating}</span>
                <span className="rating-count">(48 reviews)</span>
              </div>
              <div className="profile-status-inline">
                <span className={`status-badge ${teacherData.status}`}>
                  {teacherData.status === 'available' ? 'Available Today' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <label>Email Address</label>
                  <span>{teacherData.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-phone"></i>
                <div>
                  <label>Contact Number</label>
                  <span>{teacherData.phone}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fab fa-facebook"></i>
                <div>
                  <label>Facebook Account</label>
                  <span>{teacherData.facebook}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Professional Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <i className="fas fa-graduation-cap"></i>
                <div>
                  <label>Subject Major</label>
                  <span>{teacherData.major}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-briefcase"></i>
                <div>
                  <label>Teaching Experience</label>
                  <span>{teacherData.experience}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Availability Schedule</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <label>Days Available</label>
                  <span>{teacherData.daysAvailable.join(', ')}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <div>
                  <label>Usual Time</label>
                  <span>{teacherData.usualTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Students Schedule */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Students This Week (Dec 1-7, 2025)</h3>
          <div className="week-controls">
            <button className="btn-icon">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="current-week">Week 1, December 2025</span>
            <button className="btn-icon">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table schedule-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Parent Name</th>
                <th>Grade Level</th>
                <th>Subject</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Days</th>
                <th className="day-col">M</th>
                <th className="day-col">T</th>
                <th className="day-col">W</th>
                <th className="day-col">Th</th>
                <th className="day-col">F</th>
                <th className="day-col">S</th>
                <th>Total Earned</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.students.map((student, idx) => (
                <tr key={idx}>
                  <td className="student-name">{student.name}</td>
                  <td>{student.parent}</td>
                  <td>{student.gradeLevel}</td>
                  <td>{student.subject}</td>
                  <td>{student.time}</td>
                  <td>{student.duration}</td>
                  <td>
                    <span className="days-text">{student.days.join(', ')}</span>
                  </td>
                  <td className="day-status">{getStatusIcon(student.sessions.monday)}</td>
                  <td className="day-status">{getStatusIcon(student.sessions.tuesday)}</td>
                  <td className="day-status">{getStatusIcon(student.sessions.wednesday)}</td>
                  <td className="day-status">{getStatusIcon(student.sessions.thursday)}</td>
                  <td className="day-status">{getStatusIcon(student.sessions.friday)}</td>
                  <td className="day-status">{getStatusIcon(student.sessions.saturday)}</td>
                  <td className="total-earned">₱{student.totalEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Earnings Summary */}
        <div className="earnings-summary">
          <div className="summary-card">
            <div className="summary-label">Total Sessions Booked</div>
            <div className="summary-value">{summary.totalSessions}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Paid (Completed + Advance)</div>
            <div className="summary-value success">{summary.paidSessions}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Pending (Unpaid)</div>
            <div className="summary-value info">{summary.pendingSessions}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Earned</div>
            <div className="summary-value primary">₱{summary.totalEarned}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Company Share</div>
            <div className="summary-value">₱{summary.totalEarned * 0.25}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="status-legend">
          <div className="legend-item">
            <span className="status-icon completed-paid">✓</span>
            <span>Completed & Paid (₱100 earned)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon advance-paid">A</span>
            <span>Advance Paid (Pending Session)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon pending-unpaid">○</span>
            <span>Pending (Not Yet Paid)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon teacher-absent">T</span>
            <span>Teacher Absent (No Payment)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon student-absent">S</span>
            <span>Student Absent (No Payment)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon not-scheduled">-</span>
            <span>Not Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
