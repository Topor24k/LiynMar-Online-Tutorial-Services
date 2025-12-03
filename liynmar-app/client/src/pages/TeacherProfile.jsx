import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { teacherService } from '../services/teacherService';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: teacher } = useQuery(['teacher', id], () => teacherService.getById(id));

  // Load teacher from localStorage
  const loadTeacherData = () => {
    const allTeachers = JSON.parse(localStorage.getItem('allTeachers') || '[]');
    const foundTeacher = allTeachers.find(t => t._id === id);
    
    if (foundTeacher) {
      return foundTeacher;
    }
    
    // Return default teacher if not found in localStorage
    return {
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
    };
  };

  // Load bookings from localStorage
  const loadBookings = () => {
    const bookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
    return bookings[id] || [];
  };

  const [teacherData, setTeacherData] = useState(() => {
    const teacher = loadTeacherData();
    return { ...teacher, students: loadBookings() };
  });

  // Reload bookings when component mounts or id changes
  React.useEffect(() => {
    const teacher = loadTeacherData();
    const updatedTeacher = { ...teacher, students: loadBookings() };
    setTeacherData(updatedTeacher);
  }, [id]);

  const handleStatusChange = (studentId, dayIndex, newStatus) => {
    // Update the status
    setTeacherData(prev => {
      const updated = { ...prev };
      const student = updated.students[studentId];
      if (student.schedule[dayIndex]) {
        student.schedule[dayIndex].status = newStatus;
      }
      
      // Save to localStorage
      const bookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
      bookings[id] = updated.students;
      localStorage.setItem('teacherBookings', JSON.stringify(bookings));
      
      return updated;
    });
  };

  const handleEditClick = () => {
    setEditData({
      subject: teacherData.subject,
      phone: teacherData.phone,
      email: teacherData.email,
      facebook: teacherData.facebook,
      status: teacherData.status
    });
    setShowEditForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    
    // Update teacher data
    const updatedTeacher = {
      ...teacherData,
      subject: editData.subject,
      major: editData.subject, // Keep major in sync with subject
      phone: editData.phone,
      email: editData.email,
      facebook: editData.facebook,
      status: editData.status
    };
    
    setTeacherData(updatedTeacher);
    
    // Save to localStorage
    const allTeachers = JSON.parse(localStorage.getItem('allTeachers') || '[]');
    const teacherIndex = allTeachers.findIndex(t => t._id === id);
    
    if (teacherIndex !== -1) {
      allTeachers[teacherIndex] = {
        ...allTeachers[teacherIndex],
        subject: editData.subject,
        major: editData.subject,
        phone: editData.phone,
        email: editData.email,
        facebook: editData.facebook,
        status: editData.status
      };
      localStorage.setItem('allTeachers', JSON.stringify(allTeachers));
    }
    
    setShowEditForm(false);
    alert('Profile updated successfully!');
  };

  const getSessionByDay = (student, dayName) => {
    return student.schedule.find(s => s.day === dayName.toLowerCase());
  };

  // Convert 24-hour time to 12-hour format
  const formatTime = (time) => {
    if (!time) return 'Not set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
          title={`${currentStatus?.label}\nTime: ${formatTime(session.time)}\nDuration: ${session.duration}\nRate: ₱${session.rate.toFixed(2)}`}
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

  // Calculate teacher and company shares based on duration
  const calculateShares = (duration, totalRate) => {
    // Parse duration to get hours
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
      // Try to parse as number
      const match = durationStr.match(/([\d.]+)/);
      hours = match ? parseFloat(match[1]) : 0;
    }
    
    // Calculate based on rate structure:
    // 30 mins (0.5h) = 63 total (50 teacher, 13 company)
    // 1 hour = 125 total (100 teacher, 25 company)
    const halfHours = Math.floor(hours / 0.5);
    const fullHours = Math.floor(hours);
    const remaining30mins = halfHours - (fullHours * 2);
    
    const teacherShare = (fullHours * 100) + (remaining30mins * 50);
    const companyShare = totalRate - teacherShare;
    
    return { teacherShare, companyShare };
  };

  const calculateSummary = () => {
    let totalSessions = 0;
    let paidSessions = 0;
    let pendingSessions = 0;
    let totalEarned = 0;
    let totalTeacherShare = 0;
    let totalCompanyShare = 0;

    teacherData.students.forEach(student => {
      student.schedule.forEach(session => {
        totalSessions++;
        if (session.status === 'C' || session.status === 'A') {
          paidSessions++;
          totalEarned += session.rate;
          const shares = calculateShares(session.duration, session.rate);
          totalTeacherShare += shares.teacherShare;
          totalCompanyShare += shares.companyShare;
        }
        if (session.status === 'P') {
          pendingSessions++;
        }
      });
    });

    return { 
      totalSessions, 
      paidSessions, 
      pendingSessions, 
      totalEarned, 
      companyShare: totalCompanyShare, 
      teacherShare: totalTeacherShare 
    };
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
          <button className="btn-secondary" onClick={handleEditClick}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Teacher Profile</h3>
              <button className="btn-close" onClick={() => setShowEditForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Major Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={editData.subject}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Facebook Account</label>
                  <input
                    type="text"
                    name="facebook"
                    value={editData.facebook}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <div className="summary-label">Teacher Share</div>
            <div className="summary-value success">₱{summary.teacherShare.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Company Share</div>
            <div className="summary-value warning">₱{summary.companyShare.toFixed(2)}</div>
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
