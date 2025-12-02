import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { teacherService } from '../services/teacherService';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);

  const { data: teacher } = useQuery(['teacher', id], () => teacherService.getById(id));

  // Sample data with multiple students and different schedules
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
    status: 'active',
    rating: 4.9,
    students: [
      {
        id: 1,
        name: 'Alex Rodriguez',
        parent: 'Maria Rodriguez',
        gradeLevel: 'Grade 10',
        subject: 'Algebra',
        schedule: [
          { day: 'monday', time: '3:00 PM', duration: '1 hour', rate: 125, status: 'C' },
          { day: 'wednesday', time: '3:00 PM', duration: '1 hour', rate: 125, status: 'C' },
          { day: 'friday', time: '3:00 PM', duration: '1 hour', rate: 125, status: 'A' },
        ]
      },
      {
        id: 2,
        name: 'Sophie Chen',
        parent: 'Linda Chen',
        gradeLevel: 'Grade 9',
        subject: 'Geometry',
        schedule: [
          { day: 'tuesday', time: '4:00 PM', duration: '1.5 hours', rate: 187.50, status: 'C' },
          { day: 'thursday', time: '4:00 PM', duration: '1 hour', rate: 125, status: 'P' },
        ]
      },
      {
        id: 3,
        name: 'James Wilson',
        parent: 'Robert Wilson',
        gradeLevel: 'Grade 11',
        subject: 'Calculus',
        schedule: [
          { day: 'monday', time: '5:00 PM', duration: '1 hour', rate: 125, status: 'S' },
          { day: 'wednesday', time: '5:00 PM', duration: '30 mins', rate: 62.50, status: 'C' },
          { day: 'friday', time: '5:00 PM', duration: '1 hour', rate: 125, status: 'N' },
        ]
      },
      {
        id: 4,
        name: 'Emma Davis',
        parent: 'Sarah Davis',
        gradeLevel: 'Grade 8',
        subject: 'Pre-Algebra',
        schedule: [
          { day: 'tuesday', time: '6:00 PM', duration: '1 hour', rate: 125, status: 'T' },
          { day: 'thursday', time: '6:00 PM', duration: '1 hour', rate: 125, status: 'A' },
          { day: 'saturday', time: '2:00 PM', duration: '2 hours', rate: 250, status: 'C' },
        ]
      },
    ],
  };

  const [teacherData, setTeacherData] = useState(teacher || sampleTeacher);

  const handleStatusChange = (studentId, dayIndex, newStatus) => {
    // Update the status
    setTeacherData(prev => {
      const updated = { ...prev };
      const student = updated.students[studentId];
      if (student.schedule[dayIndex]) {
        student.schedule[dayIndex].status = newStatus;
      }
      return updated;
    });
  };

  const getSessionByDay = (student, dayName) => {
    return student.schedule.find(s => s.day === dayName.toLowerCase());
  };

  const StatusCell = ({ studentIndex, session, dayName }) => {
    const [showMenu, setShowMenu] = useState(false);
    
    const statusOptions = [
      { code: 'C', label: 'Completed & Paid', className: 'completed-paid' },
      { code: 'A', label: 'Advance Paid', className: 'advance-paid' },
      { code: 'P', label: 'Pending', className: 'pending-unpaid' },
      { code: 'T', label: 'Teacher Absent', className: 'teacher-absent' },
      { code: 'S', label: 'Student Absent', className: 'student-absent' },
      { code: 'N', label: 'No Schedule', className: 'not-scheduled' },
    ];

    const handleChange = (newCode) => {
      if (!session) {
        // Confirm before adding a new schedule
        const confirmed = window.confirm('Are you sure you want to add a schedule?');
        if (!confirmed) {
          setShowMenu(false);
          return;
        }
        alert(`Add schedule functionality for ${dayName} - Status: ${newCode}`);
        setShowMenu(false);
        return;
      }
      
      const sessionIndex = teacherData.students[studentIndex].schedule.findIndex(
        s => s.day === dayName.toLowerCase()
      );
      handleStatusChange(studentIndex, sessionIndex, newCode);
      setShowMenu(false);
    };

    // If no session exists, show clickable "N"
    if (!session) {
      return (
        <div className="status-cell-wrapper">
          <button
            className="status-icon not-scheduled clickable"
            onClick={() => setShowMenu(!showMenu)}
            title="No Schedule - Click to add"
          >
            N
          </button>
          {showMenu && (
            <>
              <div className="status-overlay" onClick={() => setShowMenu(false)}></div>
              <div className="status-menu">
                {statusOptions.map(option => (
                  <div
                    key={option.code}
                    className={`status-option ${option.className}`}
                    onClick={() => handleChange(option.code)}
                  >
                    <span className={`status-icon ${option.className}`}>{option.code}</span>
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    const currentStatus = statusOptions.find(s => s.code === session.status);

    return (
      <div className="status-cell-wrapper">
        <button
          className={`status-icon ${currentStatus?.className || 'not-scheduled'} clickable`}
          onClick={() => setShowMenu(!showMenu)}
          title={`${currentStatus?.label} - ${session.time} (${session.duration})`}
        >
          {session.status}
        </button>
        {showMenu && (
          <>
            <div className="status-overlay" onClick={() => setShowMenu(false)}></div>
            <div className="status-menu">
              {statusOptions.map(option => (
                <div
                  key={option.code}
                  className={`status-option ${option.className}`}
                  onClick={() => handleChange(option.code)}
                >
                  <span className={`status-icon ${option.className}`}>{option.code}</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const calculateSummary = () => {
    let totalSessions = 0;
    let paidSessions = 0;
    let pendingSessions = 0;
    let totalEarned = 0;

    teacherData.students.forEach(student => {
      student.schedule.forEach(session => {
        totalSessions++;
        if (session.status === 'C' || session.status === 'A') {
          paidSessions++;
          totalEarned += session.rate;
        }
        if (session.status === 'P') {
          pendingSessions++;
        }
      });
    });

    const companyShare = totalEarned * 0.25;
    const teacherShare = totalEarned * 0.75;

    return { totalSessions, paidSessions, pendingSessions, totalEarned, companyShare, teacherShare };
  };

  const calculateStudentTotal = (student) => {
    return student.schedule
      .filter(s => s.status === 'C' || s.status === 'A')
      .reduce((sum, s) => sum + s.rate, 0);
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
                  {teacherData.status === 'active' ? 'Active' : 'Inactive'}
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
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Students Schedule */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Students This Week (Dec 1-7, 2025)</h3>
          <div className="week-controls">
            <button className="btn-icon" onClick={() => setWeekOffset(weekOffset - 1)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="current-week">Week 1, December 2025</span>
            <button className="btn-icon" onClick={() => setWeekOffset(weekOffset + 1)}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table schedule-table">
            <thead>
              <tr>
                <th>Parent Name</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Subject</th>
                <th className="day-col">M</th>
                <th className="day-col">T</th>
                <th className="day-col">W</th>
                <th className="day-col">Th</th>
                <th className="day-col">F</th>
                <th className="day-col">Sa</th>
                <th className="day-col">Su</th>
                <th>Total Earnings</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.students.map((student, idx) => (
                <tr key={student.id}>
                  <td>{student.parent}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.gradeLevel}</td>
                  <td>{student.subject}</td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'monday')} dayName="monday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'tuesday')} dayName="tuesday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'wednesday')} dayName="wednesday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'thursday')} dayName="thursday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'friday')} dayName="friday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'saturday')} dayName="saturday" />
                  </td>
                  <td className="day-status">
                    <StatusCell studentIndex={idx} session={getSessionByDay(student, 'sunday')} dayName="sunday" />
                  </td>
                  <td className="total-earned">₱{calculateStudentTotal(student).toFixed(2)}</td>
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
            <div className="summary-label">Total Earnings</div>
            <div className="summary-value primary">₱{summary.totalEarned.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Company Share (25%)</div>
            <div className="summary-value">₱{summary.companyShare.toFixed(2)}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="status-legend">
          <div className="legend-item">
            <span className="status-icon completed-paid">C</span>
            <span>Completed & Paid</span>
          </div>
          <div className="legend-item">
            <span className="status-icon advance-paid">A</span>
            <span>Advance Paid (Pending Session)</span>
          </div>
          <div className="legend-item">
            <span className="status-icon pending-unpaid">P</span>
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
            <span className="status-icon not-scheduled">N</span>
            <span>No Schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
