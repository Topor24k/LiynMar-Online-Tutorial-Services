import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import teacherService from '../services/teacherService';
import bookingService from '../services/bookingService';
import './Bookings.css';

const Bookings = ({ searchQuery = '' }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [autoEncodeText, setAutoEncodeText] = useState('');
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    studentName: '',
    studentGrade: '',
    parentName: '',
    parentPhone: '',
    parentFacebook: '',
    subjectFocus: '',
    additionalNotes: '',
    weeklySchedule: {
      monday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      tuesday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      wednesday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      thursday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      friday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      saturday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      sunday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
    }
  });

  // Fetch active teachers from API
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers();
      const activeTeachers = (response.data || []).filter(t => t.status === 'active' && !t.isDeleted);
      setAllTeachers(activeTeachers);
    } catch (error) {
      toast.error('Failed to load teachers');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers based on header search query
  const filteredTeachers = allTeachers.filter((teacher) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      teacher.phone.toLowerCase().includes(query)
    );
  });

  const handleBookTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setBookingData({
      ...bookingData,
      subjectFocus: teacher.subject,
    });
    setShowBookingForm(true);
  };

  // Auto-encode pasted information
  const handleAutoEncode = (e) => {
    const text = e.target.value;
    setAutoEncodeText(text);

    // Parse the pasted text
    const lines = text.split('\n');
    const data = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const keyLower = key.trim().toLowerCase();

        if (keyLower.includes('parent fb name')) {
          data.parentName = value;
        } else if (keyLower.includes('facebook link')) {
          data.parentFacebook = value;
        } else if (keyLower.includes('student name')) {
          data.studentName = value;
        } else if (keyLower.includes('contact number')) {
          data.parentPhone = value;
        } else if (keyLower.includes('grade level')) {
          data.studentGrade = value;
        } else if (keyLower.includes('subject focus')) {
          data.subjectFocus = value;
        } else if (keyLower.includes('additional notes')) {
          data.additionalNotes = value;
        } else if (keyLower.includes('start date')) {
          data.commonStartDate = value;
        } else if (keyLower.includes('time available')) {
          data.timeAvailable = value;
        } else if (keyLower.includes('session days')) {
          data.sessionDays = value;
        } else if (keyLower.includes('date, time, and duration') || keyLower.includes('date, time and duration')) {
          data.dateTimeAndDuration = value;
        } else if (keyLower.includes('time and duration')) {
          data.timeAndDuration = value;
        }
      }
    });

    // Initialize weekly schedule
    const weeklySchedule = {
      monday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      tuesday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      wednesday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      thursday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      friday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      saturday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
      sunday: { selected: false, time: '', duration: '1', subject: '', startDate: '' },
    };

    // Helper function to convert 12-hour time to 24-hour format
    const convertTo24Hour = (timeStr) => {
      const time = timeStr.trim().toLowerCase();
      let [hourMin, period] = time.split(/\s+/);
      
      if (!period) {
        // Check if AM/PM is attached to time
        if (time.includes('am')) {
          period = 'am';
          hourMin = time.replace('am', '').trim();
        } else if (time.includes('pm')) {
          period = 'pm';
          hourMin = time.replace('pm', '').trim();
        }
      }
      
      let [hour, min] = hourMin.split(':');
      hour = parseInt(hour);
      min = min || '00';
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:${min.padStart(2, '0')}`;
    };

    // Helper function to parse date strings like "Dec 6" and convert to YYYY-MM-DD
    const parseDate = (dateStr) => {
      const currentYear = new Date().getFullYear();
      const months = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const match = dateStr.trim().toLowerCase().match(/(\w+)\s+(\d+)/);
      if (match) {
        const [, monthStr, day] = match;
        const month = months[monthStr.substring(0, 3)];
        if (month) {
          return `${currentYear}-${month}-${day.padStart(2, '0')}`;
        }
      }
      return '';
    };

    // Parse new "Date, Time, and Duration" format: "Dec 6, 6 AM Monday (30 mins), Dec 8, 7 AM Wednesday (1 hour)"
    if (data.dateTimeAndDuration) {
      const sessions = data.dateTimeAndDuration.split(',');
      
      // Track multiple sessions per day
      const daySessions = {};
      let i = 0;
      
      while (i < sessions.length) {
        const sessionTrim = sessions[i].trim();
        
        // Try to match date pattern first: "Dec 6"
        const dateMatch = sessionTrim.match(/^(\w+\s+\d+)$/);
        if (dateMatch && i + 1 < sessions.length) {
          // This is a date, get the next part which should be time, day, duration
          const startDate = parseDate(dateMatch[1]);
          const nextPart = sessions[i + 1].trim();
          
          // Match pattern: "6 AM Monday (30 mins)"
          const sessionMatch = nextPart.match(/([\d:]+\s*(?:am|pm))\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*\(([^)]+)\)/i);
          
          if (sessionMatch) {
            const [, timeStr, dayStr, durationStr] = sessionMatch;
            const day = dayStr.toLowerCase();
            
            // Convert time to 24-hour format
            const time24 = convertTo24Hour(timeStr);
            
            // Parse duration
            let duration = '1';
            const durLower = durationStr.toLowerCase();
            if (durLower.includes('30 min')) {
              duration = '0.5';
            } else if (durLower.includes('1.5 hour') || durLower.includes('1 hour 30')) {
              duration = '1.5';
            } else if (durLower.includes('2 hour')) {
              duration = '2';
            } else if (durLower.includes('1 hour')) {
              duration = '1';
            }
            
            if (!daySessions[day]) {
              daySessions[day] = [];
            }
            
            daySessions[day].push({
              time: time24,
              duration: duration,
              subject: '',
              startDate: startDate
            });
            
            i += 2; // Skip both date and session parts
            continue;
          }
        }
        i++;
      }
      
      // Set the schedule - use first session for each day
      Object.keys(daySessions).forEach(day => {
        if (weeklySchedule[day] && daySessions[day].length > 0) {
          const firstSession = daySessions[day][0];
          weeklySchedule[day].selected = true;
          weeklySchedule[day].time = firstSession.time;
          weeklySchedule[day].duration = firstSession.duration;
          weeklySchedule[day].subject = firstSession.subject;
          weeklySchedule[day].startDate = firstSession.startDate;
        }
      });
    }

    // Parse old "Time and Duration" format: "6 AM Monday (30 mins), 7 AM Wednesday (1 hour)"
    if (data.timeAndDuration) {
      const sessions = data.timeAndDuration.split(',');
      
      // Track multiple sessions per day
      const daySessions = {};
      
      sessions.forEach(session => {
        const sessionTrim = session.trim();
        
        // Match pattern: "6 AM Monday (30 mins) - Science" or "6:30 AM Tuesday (30 mins) - Math"
        const match = sessionTrim.match(/([\d:]+\s*(?:am|pm))\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*\(([^)]+)\)(?:\s*-\s*(.+))?/i);
        
        if (match) {
          const [, timeStr, dayStr, durationStr, subjectStr] = match;
          const day = dayStr.toLowerCase();
          
          // Convert time to 24-hour format
          const time24 = convertTo24Hour(timeStr);
          
          // Parse duration
          let duration = '1';
          const durLower = durationStr.toLowerCase();
          if (durLower.includes('30 min')) {
            duration = '0.5';
          } else if (durLower.includes('1.5 hour') || durLower.includes('1 hour 30')) {
            duration = '1.5';
          } else if (durLower.includes('2 hour')) {
            duration = '2';
          } else if (durLower.includes('1 hour')) {
            duration = '1';
          }
          
          // Extract subject if provided
          const subject = subjectStr ? subjectStr.trim() : '';
          
          // For multiple sessions on the same day, we'll keep the first one in the main schedule
          // and note the additional sessions (this is a limitation of the current UI structure)
          if (!daySessions[day]) {
            daySessions[day] = [];
          }
          
          daySessions[day].push({
            time: time24,
            duration: duration,
            subject: subject
          });
        }
      });
      
      // Set the schedule - use first session for each day
      Object.keys(daySessions).forEach(day => {
        if (weeklySchedule[day] && daySessions[day].length > 0) {
          const firstSession = daySessions[day][0];
          weeklySchedule[day].selected = true;
          weeklySchedule[day].time = firstSession.time;
          weeklySchedule[day].duration = firstSession.duration;
          weeklySchedule[day].subject = firstSession.subject;
          if (data.commonStartDate) {
            weeklySchedule[day].startDate = data.commonStartDate;
          }
          
          // If there are multiple sessions on the same day, combine subjects
          if (daySessions[day].length > 1) {
            const subjects = daySessions[day].map(s => s.subject).filter(s => s).join(' & ');
            if (subjects) {
              weeklySchedule[day].subject = subjects;
            }
          }
        }
      });
    }

    // Update state
    setBookingData({
      ...bookingData,
      studentName: data.studentName || bookingData.studentName,
      studentGrade: data.studentGrade || bookingData.studentGrade,
      parentName: data.parentName || bookingData.parentName,
      parentPhone: data.parentPhone || bookingData.parentPhone,
      parentFacebook: data.parentFacebook || bookingData.parentFacebook,
      subjectFocus: data.subjectFocus || bookingData.subjectFocus,
      additionalNotes: data.additionalNotes || bookingData.additionalNotes,
      weeklySchedule
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };

  const handleDayToggle = (day) => {
    setBookingData({
      ...bookingData,
      weeklySchedule: {
        ...bookingData.weeklySchedule,
        [day]: {
          ...bookingData.weeklySchedule[day],
          selected: !bookingData.weeklySchedule[day].selected,
        }
      }
    });
  };

  const handleScheduleChange = (day, field, value) => {
    setBookingData({
      ...bookingData,
      weeklySchedule: {
        ...bookingData.weeklySchedule,
        [day]: {
          ...bookingData.weeklySchedule[day],
          [field]: value,
        }
      }
    });
  };

  // Calculate rate based on duration
  const calculateRate = (duration) => {
    const dur = parseFloat(duration);
    const fullHours = Math.floor(dur);
    const remaining = dur - fullHours;
    return (fullHours * 125) + (remaining >= 0.5 ? 63 : 0);
  };

  // Calculate teacher and company shares
  const calculateShares = (duration) => {
    const dur = parseFloat(duration);
    const fullHours = Math.floor(dur);
    const remaining = dur - fullHours;
    const teacherShare = (fullHours * 100) + (remaining >= 0.5 ? 50 : 0);
    const totalRate = calculateRate(duration);
    const companyShare = totalRate - teacherShare;
    return { teacherShare, companyShare, totalRate };
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

  const calculateBookingSummary = () => {
    let totalSessions = 0;
    let weeklyTotal = 0;
    let totalTeacherShare = 0;
    let totalCompanyShare = 0;
    const rateDetails = [];

    Object.entries(bookingData.weeklySchedule).forEach(([day, schedule]) => {
      if (schedule.selected) {
        totalSessions++;
        const duration = parseFloat(schedule.duration);
        const shares = calculateShares(duration);
        weeklyTotal += shares.totalRate;
        totalTeacherShare += shares.teacherShare;
        totalCompanyShare += shares.companyShare;
        rateDetails.push({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          duration: schedule.duration === '0.5' ? '30 mins' : 
                    schedule.duration === '1' ? '1 hour' : 
                    schedule.duration === '1.5' ? '1.5 hours' :
                    schedule.duration === '2' ? '2 hours' :
                    schedule.duration === '2.5' ? '2.5 hours' :
                    schedule.duration === '3' ? '3 hours' :
                    schedule.duration === '3.5' ? '3.5 hours' :
                    schedule.duration === '4' ? '4 hours' :
                    `${schedule.duration} hours`,
          time: formatTime(schedule.time),
          totalRate: shares.totalRate,
          teacherShare: shares.teacherShare,
          companyShare: shares.companyShare
        });
      }
    });

    return { 
      totalSessions, 
      weeklyTotal, 
      totalTeacherShare, 
      totalCompanyShare, 
      rateDetails 
    };
  };

  const summary = selectedTeacher ? calculateBookingSummary() : { 
    totalSessions: 0, 
    weeklyTotal: 0, 
    totalTeacherShare: 0, 
    totalCompanyShare: 0, 
    rateDetails: [] 
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    
    // Validate that at least one day is selected
    const hasSelectedDays = Object.values(bookingData.weeklySchedule).some(s => s.selected);
    if (!hasSelectedDays) {
      alert('Please select at least one day for sessions.');
      return;
    }

    // Calculate rate based on duration
    const calculateRate = (duration) => {
      const dur = parseFloat(duration);
      const fullHours = Math.floor(dur);
      const remaining = dur - fullHours;
      return (fullHours * 125) + (remaining >= 0.5 ? 63 : 0);
    };

    // Create student object with schedule
    const schedule = [];
    Object.entries(bookingData.weeklySchedule).forEach(([day, data]) => {
      if (data.selected) {
        const duration = parseFloat(data.duration);
        const durationText = duration === 0.5 ? '30 mins' : 
                            duration === 1 ? '1 hour' :
                            duration === 1.5 ? '1.5 hours' :
                            duration === 2 ? '2 hours' :
                            `${duration} hours`;
        schedule.push({
          day: day.toLowerCase(),
          time: data.time,
          duration: durationText,
          subject: data.subject || bookingData.subjectFocus, // Use per-day subject or fallback to subject focus
          startDate: data.startDate || bookingData.startDate, // Use per-day start date or fallback
          rate: calculateRate(duration),
          status: 'P' // Default to Pending
        });
      }
    });

    const newStudent = {
      id: Date.now(),
      name: bookingData.studentName,
      parent: bookingData.parentName,
      gradeLevel: bookingData.studentGrade,
      subjectFocus: bookingData.subjectFocus, // Changed from 'subject' to 'subjectFocus'
      schedule: schedule
    };

    // Get existing bookings from localStorage
    const existingBookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
    
    // Add new student to the teacher's bookings
    if (!existingBookings[selectedTeacher._id]) {
      existingBookings[selectedTeacher._id] = [];
    }
    existingBookings[selectedTeacher._id].push(newStudent);
    
    // Save to localStorage
    localStorage.setItem('teacherBookings', JSON.stringify(existingBookings));

    console.log('Booking submitted:', {
      teacher: selectedTeacher,
      booking: bookingData,
      summary: summary
    });
    
    alert('Booking confirmed successfully! The booking will now appear in the teacher\'s student list.');
    setShowBookingForm(false);
    setSelectedTeacher(null);
    
    // Reset form
    setBookingData({
      studentName: '',
      studentGrade: '',
      parentName: '',
      parentPhone: '',
      parentFacebook: '',
      subject: '',
      startDate: '',
      additionalNotes: '',
      weeklySchedule: {
        monday: { selected: false, time: '', duration: '1' },
        tuesday: { selected: false, time: '', duration: '1' },
        wednesday: { selected: false, time: '', duration: '1' },
        thursday: { selected: false, time: '', duration: '1' },
        friday: { selected: false, time: '', duration: '1' },
        saturday: { selected: false, time: '', duration: '1' },
        sunday: { selected: false, time: '', duration: '1' },
      }
    });
  };

  const handleCancelBooking = () => {
    setShowBookingForm(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="bookings-page">
      {!showBookingForm ? (
        <>
          <div className="page-header">
            <div>
              <h2 className="page-title">Booking Management</h2>
              <p className="page-subtitle">Search for available teachers and create bookings</p>
            </div>
          </div>

          {/* Teachers Results Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Available Teachers for Booking</h3>
              <span className="card-subtitle">{filteredTeachers.length} teachers available</span>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Major Subject</th>
                    <th>Contact Number</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher._id}>
                        <td>
                          <div className="teacher-cell">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=8B7355&color=fff`}
                              alt={teacher.name}
                            />
                            <span>{teacher.name}</span>
                          </div>
                        </td>
                        <td>{teacher.subject}</td>
                        <td>{teacher.phone}</td>
                        <td>{teacher.email}</td>
                        <td>
                          <span className={`status-badge ${teacher.status}`}>
                            {teacher.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleBookTeacher(teacher)}
                          >
                            <i className="fas fa-calendar-plus"></i> Book
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No available teachers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Booking Form */}
          <div className="page-header">
            <div>
              <button className="btn-back" onClick={handleCancelBooking}>
                <i className="fas fa-arrow-left"></i> Back to Teachers
              </button>
            </div>
          </div>

          <div className="booking-form-container">
            <div className="booking-form-main">
              <form onSubmit={handleSubmitBooking}>
                {/* Teacher Info */}
                {/* Teacher Info Banner */}
                <div className="teacher-banner">
                  <div className="teacher-banner-content">
                    <div className="teacher-avatar-large">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.name)}&background=8B7355&color=fff&size=80`}
                        alt={selectedTeacher.name}
                      />
                    </div>
                    <div className="teacher-banner-info">
                      <h2 className="teacher-banner-name">{selectedTeacher.name}</h2>
                      <p className="teacher-banner-subject">
                        <i className="fas fa-book"></i> {selectedTeacher.subject} Teacher
                      </p>
                      <div className="teacher-banner-meta">
                        <span><i className="fas fa-envelope"></i> {selectedTeacher.email}</span>
                        <span><i className="fas fa-phone"></i> {selectedTeacher.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Auto-Fill Section */}
                <div className="card auto-encode-card">
                  <div className="card-header collapsible">
                    <h3 className="card-title">
                      <i className="fas fa-magic"></i> Quick Auto-Fill (Optional)
                    </h3>
                    <p className="card-description">Paste formatted booking data to auto-populate the form</p>
                  </div>
                  <div className="card-body compact">
                    <div className="auto-fill-container">
                      <div className="auto-encode-example-compact">
                        <strong>Format Example:</strong>
                        <code>
                          Parent FB Name: Name<br/>
                          Facebook Link (Optional):<br/>
                          Student Name: Name<br/>
                          Contact Number: 09XX<br/>
                          Grade Level: Grade X<br/>
                          Subject Focus: Subject<br/>
                          Date, Time, and Duration: Dec 6, 6 AM Monday (30 mins), Dec 8, 7 AM Wednesday (1 hour)<br/>
                          Additional Notes (Optional):
                        </code>
                      </div>
                      <textarea
                        id="autoEncodeText"
                        value={autoEncodeText}
                        onChange={handleAutoEncode}
                        rows="4"
                        placeholder="Paste booking information here to auto-fill the form..."
                        className="auto-encode-textarea"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information - Combined */}
                <div className="card form-section">
                  <div className="card-header">
                    <div className="section-header">
                      <div>
                        <h3 className="card-title">
                          <i className="fas fa-users"></i> Contact Information
                        </h3>
                        <p className="card-description">Student and parent/guardian details</p>
                      </div>
                      <span className="section-badge">Step 1</span>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Student Info */}
                    <div className="form-section-title">
                      <i className="fas fa-user-graduate"></i>
                      <span>Student Details</span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="studentName">
                          <i className="fas fa-user icon-label"></i> Student Name *
                        </label>
                        <input
                          type="text"
                          id="studentName"
                          name="studentName"
                          value={bookingData.studentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="studentGrade">
                          <i className="fas fa-graduation-cap icon-label"></i> Grade Level *
                        </label>
                        <select
                          id="studentGrade"
                          name="studentGrade"
                          value={bookingData.studentGrade}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select grade level</option>
                          <option value="Grade 1">Grade 1</option>
                          <option value="Grade 2">Grade 2</option>
                          <option value="Grade 3">Grade 3</option>
                          <option value="Grade 4">Grade 4</option>
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-divider"></div>

                    {/* Parent Info */}
                    <div className="form-section-title">
                      <i className="fas fa-user-friends"></i>
                      <span>Parent/Guardian Details</span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="parentName">
                          <i className="fab fa-facebook icon-label"></i> Parent FB Name *
                        </label>
                        <input
                          type="text"
                          id="parentName"
                          name="parentName"
                          value={bookingData.parentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Facebook name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="parentPhone">
                          <i className="fas fa-phone icon-label"></i> Contact Number *
                        </label>
                        <input
                          type="tel"
                          id="parentPhone"
                          name="parentPhone"
                          value={bookingData.parentPhone}
                          onChange={handleInputChange}
                          required
                          placeholder="09XX XXX XXXX"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="parentFacebook">
                          <i className="fas fa-link icon-label"></i> Facebook Profile Link
                        </label>
                        <input
                          type="text"
                          id="parentFacebook"
                          name="parentFacebook"
                          value={bookingData.parentFacebook}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/username (optional)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="card form-section">
                  <div className="card-header">
                    <div className="section-header">
                      <div>
                        <h3 className="card-title">
                          <i className="fas fa-calendar-alt"></i> Session Schedule
                        </h3>
                        <p className="card-description">Configure tutoring sessions and timing</p>
                      </div>
                      <span className="section-badge">Step 2</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="form-group full-width">
                      <label htmlFor="subjectFocus">
                        <i className="fas fa-book-open icon-label"></i> Subject Focus *
                      </label>
                      <input
                        type="text"
                        id="subjectFocus"
                        name="subjectFocus"
                        value={bookingData.subjectFocus}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Math and Science, English Literature, etc."
                      />
                      <p className="form-help">Primary subjects that will be covered in the tutoring sessions</p>
                    </div>

                    <div className="form-divider"></div>

                    {/* Weekly Schedule */}
                    <div className="form-group full-width">
                      <label className="schedule-label">
                        <i className="fas fa-calendar-week icon-label"></i> Weekly Schedule *
                      </label>
                      <p className="form-help">Select days and configure session time, duration, and start date for each</p>
                      <div className="weekly-schedule">
                        {Object.entries(bookingData.weeklySchedule).map(([day, schedule]) => (
                          <div key={day} className={`day-schedule ${schedule.selected ? 'selected' : ''}`}>
                            <div className="day-header">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={schedule.selected}
                                  onChange={() => handleDayToggle(day)}
                                />
                                <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                              </label>
                            </div>
                            {schedule.selected && (
                              <div className="day-details">
                                <div className="detail-field">
                                  <label>Time</label>
                                  <input
                                    type="time"
                                    value={schedule.time}
                                    onChange={(e) => handleScheduleChange(day, 'time', e.target.value)}
                                  />
                                </div>
                                <div className="detail-field">
                                  <label>Duration</label>
                                  <select
                                    value={schedule.duration}
                                    onChange={(e) => handleScheduleChange(day, 'duration', e.target.value)}
                                  >
                                    <option value="0.5">30 mins</option>
                                    <option value="1">1 hour</option>
                                    <option value="1.5">1.5 hours</option>
                                    <option value="2">2 hours</option>
                                    <option value="2.5">2.5 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="3.5">3.5 hours</option>
                                    <option value="4">4 hours</option>
                                  </select>
                                </div>
                                <div className="detail-field">
                                  <label>Start Date</label>
                                  <input
                                    type="date"
                                    value={schedule.startDate}
                                    onChange={(e) => handleScheduleChange(day, 'startDate', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-divider"></div>

                    <div className="form-group full-width">
                      <label htmlFor="additionalNotes">
                        <i className="fas fa-sticky-note icon-label"></i> Additional Notes
                      </label>
                      <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={bookingData.additionalNotes}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Any special requirements, learning preferences, or important information..."
                      />
                      <p className="form-help">Optional: Include any specific needs or special considerations</p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions-container">
                  <p className="form-actions-note">
                    <i className="fas fa-info-circle"></i>
                    Please review all information before confirming the booking
                  </p>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary btn-large" onClick={handleCancelBooking}>
                      <i className="fas fa-times-circle"></i> Cancel
                    </button>
                    <button type="submit" className="btn-primary btn-large">
                      <i className="fas fa-check-circle"></i> Confirm Booking
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="booking-summary-sidebar">
              <div className="card sticky-summary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-file-invoice-dollar"></i> Booking Summary
                  </h3>
                </div>
                <div className="card-body">
                  <div className="summary-section">
                    <div className="summary-item">
                      <span className="summary-label">Total Sessions per Week</span>
                      <span className="summary-value">{summary.totalSessions}</span>
                    </div>
                  </div>

                  <div className="summary-section">
                    <h4 className="summary-subtitle">Session Details</h4>
                    {summary.rateDetails.length > 0 ? (
                      summary.rateDetails.map((detail, idx) => (
                        <div key={idx} className="rate-detail">
                          <div className="rate-day">{detail.day}</div>
                          <div className="rate-info">
                            {detail.time} • {detail.duration}
                          </div>
                          <div className="rate-breakdown">
                            <div className="rate-amount">₱{detail.totalRate.toFixed(2)}</div>
                            <div className="rate-shares">
                              <span className="share-teacher">Teacher: ₱{detail.teacherShare}</span>
                              <span className="share-company">Company: ₱{detail.companyShare}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small">No days selected yet</p>
                    )}
                  </div>

                  <div className="summary-total">
                    <h4 className="summary-subtitle">Weekly Summary</h4>
                    <div className="rate-detail">
                      <div className="rate-day">Weekly Total</div>
                      <div className="rate-breakdown">
                        <div className="rate-amount">₱{summary.weeklyTotal.toFixed(2)}</div>
                        <div className="rate-shares">
                          <span className="share-teacher">Teacher: ₱{summary.totalTeacherShare.toFixed(2)}</span>
                          <span className="share-company">Company: ₱{summary.totalCompanyShare.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="summary-note">
                    <i className="fas fa-info-circle"></i>
                    <span>Rate: 30 mins = ₱63 | 1 hour = ₱125</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Bookings;
