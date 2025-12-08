import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import teacherService from '../services/teacherService';
import bookingService from '../services/bookingService';
import './TeacherProfile.css';

// Teacher Profile Component - Week/Month View
const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [allBookings, setAllBookings] = useState([]);

  const fetchTeacherData = async () => {
    try {
      const response = await teacherService.getTeacherById(id);
      
      // The API returns {teacher: {...}, bookings: [...], totalBookings: number}
      const data = response.data || response;
      const teacherInfo = data.teacher || data;
      
      setTeacherData(prev => ({
        ...teacherInfo,
        students: prev?.students || [] // Preserve existing students array if it exists
      }));
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await bookingService.getBookingsByTeacher(id);
      
      // The API returns {status: 'success', results: n, data: [...]}
      const bookings = response.data || response || [];
      setAllBookings(bookings);
      
      // Initial filter for current week/month
      filterBookingsByDate(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getWeekRange = (offset) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    
    // Get Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  };

  const getMonthRange = (offset) => {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    
    const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  const filterBookingsByDate = (bookingsData = allBookings) => {
    const range = viewMode === 'week' ? getWeekRange(weekOffset) : getMonthRange(weekOffset);
    
    // Helper to get day name from date
    const getDayNameFromDate = (date) => {
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayMap[date.getDay()];
    };
    
    // Helper to get all weeks in a month
    const getWeeksInRange = (start, end) => {
      const weeks = [];
      let currentMonday = new Date(start);
      const day = currentMonday.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      currentMonday.setDate(currentMonday.getDate() + diffToMonday);
      
      while (currentMonday <= end) {
        const weekStart = new Date(currentMonday);
        const weekEnd = new Date(currentMonday);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weeks.push({ start: weekStart, end: weekEnd });
        currentMonday.setDate(currentMonday.getDate() + 7);
      }
      return weeks;
    };
    
    const students = [];
    
    if (viewMode === 'month') {
      // In month view, create separate rows for each week
      const weeks = getWeeksInRange(range.start, range.end);
      
      bookingsData.forEach(booking => {
        weeks.forEach(week => {
          const schedule = [];
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          let weekEarnings = 0;
          let hasNonNStatus = false;
          
          // Iterate through all days in the booking's weeklySchedule
          days.forEach(bookingDay => {
            const daySchedule = booking.weeklySchedule && booking.weeklySchedule[bookingDay];
            const isScheduled = daySchedule ? (typeof daySchedule === 'boolean' ? daySchedule : daySchedule.isScheduled) : false;
            
            if (isScheduled) {
              // Get session status (handle both old string and new object format)
              const sessionDay = booking.sessionStatus && booking.sessionStatus[bookingDay];
              let statusCode = 'N';
              let dayDate = null;
              
              if (sessionDay) {
                statusCode = typeof sessionDay === 'string' ? sessionDay : (sessionDay.status || 'N');
                // Use the actual date from sessionStatus if available
                dayDate = (typeof sessionDay === 'object' && sessionDay.date) ? new Date(sessionDay.date) : null;
              }
              
              // If no date in sessionStatus, skip this day (it's not scheduled for any specific date)
              if (!dayDate) {
                return;
              }
              
              // Check if this day's date falls within the current week
              const isDayInWeek = dayDate >= week.start && dayDate <= week.end;
              
              if (!isDayInWeek) {
                return; // Skip days not in this week
              }
              
              // Get the actual day name based on the date (e.g., Dec 7 is Sunday, Dec 8 is Monday)
              const actualDayName = getDayNameFromDate(dayDate);
              
              // Track if this week has any non-'N' status
              if (statusCode !== 'N') {
                hasNonNStatus = true;
              }
              
              // Get duration and calculate rate
              const duration = (daySchedule && typeof daySchedule === 'object') ? daySchedule.duration : 1;
              const rateMap = { 0.5: 63, 1: 125, 1.5: 188, 2: 250 };
              const teacherShareMap = { 0.5: 50, 1: 100, 1.5: 150, 2: 200 };
              const fullRate = rateMap[duration] || 125;
              const teacherShare = teacherShareMap[duration] || 100;
              
              // Calculate teacher share only for 'C' (Completed & Paid) and 'A' (Advance Paid)
              if (statusCode === 'C' || statusCode === 'A') {
                weekEarnings += teacherShare;
              }
              
              schedule.push({
                day: actualDayName, // Use the actual day name from the date
                status: statusCode,
                startDate: dayDate,
                time: '14:00',
                duration: duration,
                rate: fullRate
              });
            }
          });
          
          // Only add row if there are scheduled sessions AND at least one non-'N' status in this week
          if (schedule.length > 0 && hasNonNStatus) {
            students.push({
              id: `${booking._id}_${week.start.getTime()}`,
              bookingId: booking._id,
              parent: booking.parentFbName,
              name: booking.studentName,
              gradeLevel: booking.gradeLevel,
              subject: booking.subjectFocus,
              subjectFocus: booking.subjectFocus,
              contactNumber: booking.contactNumber,
              facebookProfileLink: booking.facebookProfileLink,
              additionalNote: booking.additionalNote,
              weekStartDate: week.start,
              weekEndDate: week.end,
              schedule: schedule,
              weekEarnings: weekEarnings
            });
          }
        });
      });
    } else {
      // Week view - use sessionStatus dates directly
      bookingsData.forEach(booking => {
        const schedule = [];
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let weekEarnings = 0;
        let hasSessionsInWeek = false;
        
        days.forEach(bookingDay => {
          const daySchedule = booking.weeklySchedule && booking.weeklySchedule[bookingDay];
          const isScheduled = daySchedule ? (typeof daySchedule === 'boolean' ? daySchedule : daySchedule.isScheduled) : false;
          
          if (isScheduled) {
            // Get session status (handle both old string and new object format)
            const sessionDay = booking.sessionStatus && booking.sessionStatus[bookingDay];
            let statusCode = 'N';
            let dayDate = null;
            
            if (sessionDay) {
              statusCode = typeof sessionDay === 'string' ? sessionDay : (sessionDay.status || 'N');
              // Use the actual date from sessionStatus if available
              dayDate = (typeof sessionDay === 'object' && sessionDay.date) ? new Date(sessionDay.date) : null;
            }
            
            // If no date in sessionStatus, skip this day
            if (!dayDate) {
              return;
            }
            
            // Check if this day's date falls within the current week range
            const isDayInRange = dayDate >= range.start && dayDate <= range.end;
            
            if (!isDayInRange) {
              return; // Skip days not in this week
            }
            
            hasSessionsInWeek = true;
            
            // Get the actual day name based on the date (e.g., Dec 7 is Sunday, Dec 8 is Monday)
            const actualDayName = getDayNameFromDate(dayDate);
            
            const duration = (daySchedule && typeof daySchedule === 'object') ? daySchedule.duration : 1;
            const rateMap = { 0.5: 63, 1: 125, 1.5: 188, 2: 250 };
            const teacherShareMap = { 0.5: 50, 1: 100, 1.5: 150, 2: 200 };
            const fullRate = rateMap[duration] || 125;
            const teacherShare = teacherShareMap[duration] || 100;
            
            // Calculate teacher share only for 'C' and 'A' statuses
            if (statusCode === 'C' || statusCode === 'A') {
              weekEarnings += teacherShare;
            }
            
            schedule.push({
              day: actualDayName, // Use the actual day name from the date
              status: statusCode,
              startDate: dayDate,
              time: '14:00',
              duration: duration,
              rate: fullRate
            });
          }
        });
        
        // Only add booking if it has sessions in the current week
        if (hasSessionsInWeek) {
          students.push({
            id: booking._id,
            bookingId: booking._id,
            parent: booking.parentFbName,
            name: booking.studentName,
            gradeLevel: booking.gradeLevel,
            subject: booking.subjectFocus,
            subjectFocus: booking.subjectFocus,
            contactNumber: booking.contactNumber,
            facebookProfileLink: booking.facebookProfileLink,
            additionalNote: booking.additionalNote,
            weekStartDate: booking.weekStartDate,
            weekEndDate: booking.weekEndDate,
            schedule: schedule,
            weekEarnings: weekEarnings
          });
        }
      });
    }
    
    setTeacherData(prev => ({
      ...prev,
      students: students
    }));
  };

  const formatDateRange = () => {
    const range = viewMode === 'week' ? getWeekRange(weekOffset) : getMonthRange(weekOffset);
    
    if (viewMode === 'week') {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${range.start.toLocaleDateString('en-US', options)} - ${range.end.toLocaleDateString('en-US', options)}`;
    } else {
      const options = { month: 'long', year: 'numeric' };
      return range.start.toLocaleDateString('en-US', options);
    }
  };

  // Get the dates for each day of the week
  const getWeekDayDates = () => {
    const range = getWeekRange(weekOffset);
    const monday = new Date(range.start);
    
    return {
      monday: monday.getDate(),
      tuesday: new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000).getDate(),
      wednesday: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000).getDate(),
      thursday: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000).getDate(),
      friday: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000).getDate(),
      saturday: new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000).getDate(),
      sunday: new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()
    };
  };

  // Fetch teacher data and bookings from API
  useEffect(() => {
    fetchTeacherData();
    fetchAllBookings();
  }, [id]);

  // Filter bookings when week offset or view mode changes
  useEffect(() => {
    if (allBookings.length > 0) {
      filterBookingsByDate();
    }
  }, [weekOffset, viewMode, allBookings]);

  const handleEditClick = () => {
    setEditData({
      majorSubject: teacherData.majorSubject || teacherData.subject,
      contactNumber: teacherData.contactNumber || teacherData.phone,
      email: teacherData.email,
      facebookAccount: teacherData.facebookAccount || teacherData.facebook,
      status: teacherData.status,
      jobExperience: teacherData.jobExperience || [{
        jobTitle: '',
        companyName: '',
        employmentType: 'Full Time',
        startDate: '',
        endDate: '',
        jobLocation: ''
      }]
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

  const handleJobExperienceChange = (index, field, value) => {
    const updatedExperience = [...editData.jobExperience];
    updatedExperience[index][field] = value;
    setEditData({
      ...editData,
      jobExperience: updatedExperience
    });
  };

  const addJobExperience = () => {
    setEditData({
      ...editData,
      jobExperience: [...editData.jobExperience, {
        jobTitle: '',
        companyName: '',
        employmentType: 'Full Time',
        startDate: '',
        endDate: '',
        jobLocation: ''
      }]
    });
  };

  const removeJobExperience = (index) => {
    const updatedExperience = editData.jobExperience.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      jobExperience: updatedExperience
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await teacherService.updateTeacher(id, editData);
      
      toast.success('Teacher profile updated successfully!');
      setShowEditForm(false);
      
      // Refresh teacher data
      await fetchTeacherData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update teacher');
    } finally {
      setLoading(false);
    }
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
      { code: 'AT', label: 'Advance Paid - Teacher Absent', className: 'teacher-absent' },
      { code: 'AS', label: 'Advance Paid - Student Absent', className: 'student-absent' },
      { code: 'N', label: 'No Schedule', className: 'not-scheduled' },
    ];

    const handleChange = async (newCode) => {
      if (!session) {
        setShowMenu(false);
        return;
      }
      
      const student = teacherData.students[studentIndex];
      const bookingId = student.bookingId || student.id;
      
      try {
        // Build the sessionStatus object with the updated day
        // Handle both old (string) and new (object) format
        const sessionStatus = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
          const scheduleDay = student.schedule.find(s => s.day === day);
          if (scheduleDay) {
            // Only set dates if status is not 'N'
            const hasSchedule = scheduleDay.status !== 'N';
            sessionStatus[day] = {
              status: scheduleDay.status,
              date: hasSchedule ? scheduleDay.startDate : null,
              weekStart: hasSchedule ? student.weekStartDate : null,
              weekEnd: hasSchedule ? student.weekEndDate : null
            };
          } else {
            sessionStatus[day] = {
              status: 'N',
              date: null,
              weekStart: null,
              weekEnd: null
            };
          }
        });
        
        // Update the specific day with new status
        const updatingToNoSchedule = newCode === 'N';
        sessionStatus[dayName.toLowerCase()] = {
          status: newCode,
          date: updatingToNoSchedule ? null : sessionStatus[dayName.toLowerCase()].date,
          weekStart: updatingToNoSchedule ? null : student.weekStartDate,
          weekEnd: updatingToNoSchedule ? null : student.weekEndDate
        };
        
        // Update the booking in the database
        await bookingService.updateBooking(bookingId, { sessionStatus });
        
        // Update status in the students array locally
        setTeacherData(prev => {
          const updated = { ...prev };
          const student = updated.students[studentIndex];
          const sessionIndex = student.schedule.findIndex(s => s.day === dayName.toLowerCase());
          if (sessionIndex !== -1) {
            student.schedule[sessionIndex].status = newCode;
          }
          return updated;
        });
        
        toast.success('Session status updated successfully!');
      } catch (error) {
        console.error('Error updating session status:', error);
        toast.error('Failed to update session status');
      }
      
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
          title={`${currentStatus?.label}\nDate: ${session.startDate || 'Not set'}\nTime: ${formatTime(session.time)}\nDuration: ${session.duration}\nRate: ₱${session.rate.toFixed(2)}`}
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
    // duration is now a number (0.5, 1, 1.5, 2)
    const hours = typeof duration === 'number' ? duration : parseFloat(duration) || 1;
    
    // Fixed teacher and company shares based on duration
    const shareMap = {
      0.5: { teacher: 50, company: 13 },   // 30 mins
      1: { teacher: 100, company: 25 },    // 1 hour
      1.5: { teacher: 150, company: 38 },  // 1.5 hours
      2: { teacher: 200, company: 50 }     // 2 hours
    };
    
    const shares = shareMap[hours] || { teacher: 100, company: 25 }; // default to 1 hour
    
    return { teacherShare: shares.teacher, companyShare: shares.company };
  };

  const calculateSummary = () => {
    let totalSessions = 0;
    let paidSessions = 0;
    let pendingSessions = 0;
    let totalEarned = 0;
    let totalTeacherShare = 0;
    let totalCompanyShare = 0;

    if (teacherData && teacherData.students && Array.isArray(teacherData.students)) {
      teacherData.students.forEach(student => {
        if (student.schedule && Array.isArray(student.schedule)) {
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
        }
      });
    }

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
    if (!student.schedule || !Array.isArray(student.schedule)) {
      return 0;
    }
    return student.schedule
      .filter(s => s.status === 'C' || s.status === 'A')
      .reduce((sum, s) => sum + s.rate, 0);
  };

  const summary = calculateSummary();

  // Calculate total earnings for a booking
  const calculateTotalEarnings = (booking) => {
    return booking.totalEarningsPerWeek || 0;
  };

  if (loading || !teacherData) {
    return (
      <div className="teacher-profile-page">
        <div className="loading">Loading teacher profile...</div>
      </div>
    );
  }

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
                    name="majorSubject"
                    value={editData.majorSubject}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={editData.contactNumber}
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
                    name="facebookAccount"
                    value={editData.facebookAccount}
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

              {/* Job Experience Section */}
              <div className="job-experience-section">
                <div className="section-header">
                  <h4>Job Experience</h4>
                  <button type="button" className="btn-add-experience" onClick={addJobExperience}>
                    <i className="fas fa-plus"></i> Add Experience
                  </button>
                </div>

                {editData.jobExperience && editData.jobExperience.map((exp, index) => (
                  <div key={index} className="experience-card">
                    <div className="experience-header">
                      <h5>Experience {index + 1}</h5>
                      {editData.jobExperience.length > 1 && (
                        <button type="button" className="btn-remove" onClick={() => removeJobExperience(index)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleJobExperienceChange(index, 'jobTitle', e.target.value)}
                          placeholder="e.g., Senior Teacher"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => handleJobExperienceChange(index, 'companyName', e.target.value)}
                          placeholder="e.g., ABC School"
                        />
                      </div>
                      <div className="form-group">
                        <label>Employment Type</label>
                        <select
                          value={exp.employmentType}
                          onChange={(e) => handleJobExperienceChange(index, 'employmentType', e.target.value)}
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Internship">Internship</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Contractual">Contractual</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleJobExperienceChange(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleJobExperienceChange(index, 'endDate', e.target.value)}
                          placeholder="Leave empty if current"
                        />
                      </div>
                      <div className="form-group">
                        <label>Job Location</label>
                        <input
                          type="text"
                          value={exp.jobLocation}
                          onChange={(e) => handleJobExperienceChange(index, 'jobLocation', e.target.value)}
                          placeholder="e.g., Manila, Philippines"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
            <p className="profile-subject">{teacherData.majorSubject || teacherData.subject} Teacher</p>
            <div className="profile-meta">
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
                  <span>{teacherData.contactNumber || teacherData.phone}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fab fa-facebook"></i>
                <div>
                  <label>Facebook Account</label>
                  <span>{teacherData.facebookAccount || teacherData.facebook}</span>
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
                  <span>{teacherData.majorSubject || teacherData.subject || teacherData.major}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Experience Section */}
          {teacherData.jobExperience && teacherData.jobExperience.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">Job Experience</h3>
              <div className="experience-timeline">
                {teacherData.jobExperience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-icon">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="experience-content">
                      <h4 className="experience-title">{exp.jobTitle || 'Position Not Specified'}</h4>
                      <p className="experience-company">
                        {exp.companyName || 'Company Not Specified'}
                        {exp.employmentType && (
                          <span className="employment-type">{exp.employmentType}</span>
                        )}
                      </p>
                      <div className="experience-details">
                        {(exp.startDate || exp.endDate) && (
                          <span className="experience-date">
                            <i className="fas fa-calendar"></i>
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Not specified'}
                            {' - '}
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                          </span>
                        )}
                        {exp.jobLocation && (
                          <span className="experience-location">
                            <i className="fas fa-map-marker-alt"></i>
                            {exp.jobLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Students Schedule */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {viewMode === 'week' ? 'Weekly' : 'Monthly'} Students Schedule 
            ({teacherData.students ? teacherData.students.length : 0} Bookings)
          </h3>
          <div className="week-controls">
            <div className="view-mode-toggle" style={{ marginRight: '1rem' }}>
              <button 
                className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => { setViewMode('week'); setWeekOffset(0); }}
              >
                <i className="fas fa-calendar-week"></i>
                Week
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => { setViewMode('month'); setWeekOffset(0); }}
              >
                <i className="fas fa-calendar-alt"></i>
                Month
              </button>
            </div>
            <button className="btn-icon" onClick={() => setWeekOffset(weekOffset - 1)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="current-week">{formatDateRange()}</span>
            <button className="btn-icon" onClick={() => setWeekOffset(weekOffset + 1)}>
              <i className="fas fa-chevron-right"></i>
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setWeekOffset(0)}
              title="Go to current week/month"
              style={{ marginLeft: '0.5rem' }}
            >
              <i className="fas fa-calendar-day"></i>
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table schedule-table">
            <thead>
              <tr>
                <th>PARENT FB NAME</th>
                <th>STUDENT NAME</th>
                <th>GRADE LEVEL</th>
                <th>SUBJECT FOCUS</th>
                {viewMode === 'month' && <th>WEEK</th>}
                {viewMode === 'week' ? (
                  <>
                    <th className="day-col">M<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().monday}</span></th>
                    <th className="day-col">T<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().tuesday}</span></th>
                    <th className="day-col">W<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().wednesday}</span></th>
                    <th className="day-col">Th<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().thursday}</span></th>
                    <th className="day-col">F<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().friday}</span></th>
                    <th className="day-col">Sa<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().saturday}</span></th>
                    <th className="day-col">Su<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>{getWeekDayDates().sunday}</span></th>
                  </>
                ) : (
                  <>
                    <th className="day-col">M</th>
                    <th className="day-col">T</th>
                    <th className="day-col">W</th>
                    <th className="day-col">Th</th>
                    <th className="day-col">F</th>
                    <th className="day-col">Sa</th>
                    <th className="day-col">Su</th>
                  </>
                )}
                <th>TEACHER SHARE</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.students && teacherData.students.length > 0 ? (
                teacherData.students.map((student, idx) => (
                  <tr key={student.id}>
                    <td>{student.parent}</td>
                    <td className="student-name">{student.name}</td>
                    <td>{student.gradeLevel}</td>
                    <td>{student.subjectFocus || student.subject}</td>
                    {viewMode === 'month' && (
                      <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(student.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(student.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    )}
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
                    <td className="total-earned">₱{(student.weekEarnings || calculateStudentTotal(student)).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === 'month' ? "13" : "12"} style={{ textAlign: 'center', padding: '2rem' }}>
                    No students booked for this {viewMode === 'week' ? 'week' : 'month'}
                  </td>
                </tr>
              )}
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
            <span className="status-icon teacher-absent">AT</span>
            <span>Advance Paid - Teacher Absent</span>
          </div>
          <div className="legend-item">
            <span className="status-icon student-absent">AS</span>
            <span>Advance Paid - Student Absent</span>
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
