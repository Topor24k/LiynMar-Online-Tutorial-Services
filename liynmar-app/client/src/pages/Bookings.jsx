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
    weeks: [
      {
        id: Date.now(),
        weekStartDate: null,
        weekEndDate: null,
        schedule: {
          monday: { selected: false, time: '', duration: '1', subject: '' },
          tuesday: { selected: false, time: '', duration: '1', subject: '' },
          wednesday: { selected: false, time: '', duration: '1', subject: '' },
          thursday: { selected: false, time: '', duration: '1', subject: '' },
          friday: { selected: false, time: '', duration: '1', subject: '' },
          saturday: { selected: false, time: '', duration: '1', subject: '' },
          sunday: { selected: false, time: '', duration: '1', subject: '' },
        }
      }
    ]
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
      (teacher.majorSubject && teacher.majorSubject.toLowerCase().includes(query)) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(query)) ||
      teacher.email.toLowerCase().includes(query) ||
      (teacher.contactNumber && teacher.contactNumber.toLowerCase().includes(query)) ||
      (teacher.phone && teacher.phone.toLowerCase().includes(query))
    );
  });

  const handleBookTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    
    // Get current week's Monday
    const today = new Date();
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 1 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    setBookingData({
      ...bookingData,
      subjectFocus: teacher.majorSubject || teacher.subject,
      weeks: [
        {
          id: Date.now(),
          weekStartDate: monday,
          weekEndDate: sunday,
          schedule: {
            monday: { selected: false, time: '', duration: '1', subject: '' },
            tuesday: { selected: false, time: '', duration: '1', subject: '' },
            wednesday: { selected: false, time: '', duration: '1', subject: '' },
            thursday: { selected: false, time: '', duration: '1', subject: '' },
            friday: { selected: false, time: '', duration: '1', subject: '' },
            saturday: { selected: false, time: '', duration: '1', subject: '' },
            sunday: { selected: false, time: '', duration: '1', subject: '' },
          }
        }
      ]
    });
    setShowBookingForm(true);
  };

  const addWeek = () => {
    const lastWeek = bookingData.weeks[bookingData.weeks.length - 1];
    const newWeekStart = new Date(lastWeek.weekStartDate);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    
    const newWeekEnd = new Date(newWeekStart);
    newWeekEnd.setDate(newWeekEnd.getDate() + 6);
    newWeekEnd.setHours(23, 59, 59, 999);
    
    setBookingData({
      ...bookingData,
      weeks: [
        ...bookingData.weeks,
        {
          id: Date.now(),
          weekStartDate: newWeekStart,
          weekEndDate: newWeekEnd,
          schedule: {
            monday: { selected: false, time: '', duration: '1', subject: '' },
            tuesday: { selected: false, time: '', duration: '1', subject: '' },
            wednesday: { selected: false, time: '', duration: '1', subject: '' },
            thursday: { selected: false, time: '', duration: '1', subject: '' },
            friday: { selected: false, time: '', duration: '1', subject: '' },
            saturday: { selected: false, time: '', duration: '1', subject: '' },
            sunday: { selected: false, time: '', duration: '1', subject: '' },
          }
        }
      ]
    });
  };

  const removeWeek = (weekIndex) => {
    if (bookingData.weeks.length > 1) {
      setBookingData({
        ...bookingData,
        weeks: bookingData.weeks.filter((_, index) => index !== weekIndex)
      });
    }
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

    // Helper function to parse date strings like "Dec 6" and convert to Date object
    const parseDate = (dateStr) => {
      const currentYear = new Date().getFullYear();
      const months = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
        'may': 4, 'jun': 5, 'jul': 6, 'aug': 7,
        'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      
      const match = dateStr.trim().toLowerCase().match(/(\w+)\s+(\d+)/);
      if (match) {
        const [, monthStr, day] = match;
        const monthIndex = months[monthStr.substring(0, 3)];
        if (monthIndex !== undefined) {
          return new Date(currentYear, monthIndex, parseInt(day));
        }
      }
      return null;
    };

    // Helper function to get Monday of a given date's week
    const getMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    };

    // Helper function to get Sunday of a given date's week
    const getSunday = (monday) => {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return sunday;
    };

    // Parse "Date, Time, and Duration" format and auto-create weeks
    const allSessions = [];
    
    if (data.dateTimeAndDuration) {
      const sessions = data.dateTimeAndDuration.split(',');
      
      let i = 0;
      while (i < sessions.length) {
        const sessionTrim = sessions[i].trim();
        
        // Try to match date pattern first: "Dec 6"
        const dateMatch = sessionTrim.match(/^(\w+\s+\d+)$/);
        if (dateMatch && i + 1 < sessions.length) {
          const sessionDate = parseDate(dateMatch[1]);
          const nextPart = sessions[i + 1].trim();
          
          // Match pattern: "6 AM Monday (30 mins)"
          const sessionMatch = nextPart.match(/([\d:]+\s*(?:am|pm))\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*\(([^)]+)\)/i);
          
          if (sessionMatch && sessionDate) {
            const [, timeStr, dayStr, durationStr] = sessionMatch;
            const day = dayStr.toLowerCase();
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
            
            allSessions.push({
              date: sessionDate,
              day: day,
              time: time24,
              duration: duration,
              subject: ''
            });
            
            i += 2;
            continue;
          }
        }
        i++;
      }
    }

    // Group sessions by week
    const weekMap = new Map();
    
    allSessions.forEach(session => {
      const monday = getMonday(session.date);
      const weekKey = monday.getTime();
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekStartDate: monday,
          weekEndDate: getSunday(monday),
          sessions: []
        });
      }
      
      weekMap.get(weekKey).sessions.push(session);
    });

    // Convert weekMap to weeks array
    const weeks = Array.from(weekMap.values())
      .sort((a, b) => a.weekStartDate - b.weekStartDate)
      .map((week, index) => {
        const schedule = {
          monday: { selected: false, time: '', duration: '1', subject: '' },
          tuesday: { selected: false, time: '', duration: '1', subject: '' },
          wednesday: { selected: false, time: '', duration: '1', subject: '' },
          thursday: { selected: false, time: '', duration: '1', subject: '' },
          friday: { selected: false, time: '', duration: '1', subject: '' },
          saturday: { selected: false, time: '', duration: '1', subject: '' },
          sunday: { selected: false, time: '', duration: '1', subject: '' },
        };

        week.sessions.forEach(session => {
          schedule[session.day] = {
            selected: true,
            time: session.time,
            duration: session.duration,
            subject: session.subject
          };
        });

        return {
          id: Date.now() + index,
          weekStartDate: week.weekStartDate,
          weekEndDate: week.weekEndDate,
          schedule: schedule
        };
      });

    // If no weeks created from dates, create default current week
    if (weeks.length === 0) {
      const today = new Date();
      const monday = getMonday(today);
      const sunday = getSunday(monday);

      weeks.push({
        id: Date.now(),
        weekStartDate: monday,
        weekEndDate: sunday,
        schedule: {
          monday: { selected: false, time: '', duration: '1', subject: '' },
          tuesday: { selected: false, time: '', duration: '1', subject: '' },
          wednesday: { selected: false, time: '', duration: '1', subject: '' },
          thursday: { selected: false, time: '', duration: '1', subject: '' },
          friday: { selected: false, time: '', duration: '1', subject: '' },
          saturday: { selected: false, time: '', duration: '1', subject: '' },
          sunday: { selected: false, time: '', duration: '1', subject: '' },
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
      weeks: weeks
    });
  };

  const handleDayToggle = (weekIndex, day) => {
    const updatedWeeks = [...bookingData.weeks];
    updatedWeeks[weekIndex].schedule[day].selected = !updatedWeeks[weekIndex].schedule[day].selected;
    
    setBookingData({
      ...bookingData,
      weeks: updatedWeeks
    });
  };

  const handleScheduleChange = (weekIndex, day, field, value) => {
    const updatedWeeks = [...bookingData.weeks];
    updatedWeeks[weekIndex].schedule[day][field] = value;
    
    setBookingData({
      ...bookingData,
      weeks: updatedWeeks
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value,
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
    let grandTotal = 0;
    let totalTeacherShare = 0;
    let totalCompanyShare = 0;
    const weekDetails = [];

    bookingData.weeks.forEach((week, weekIndex) => {
      let weeklyTotal = 0;
      let weekTeacherShare = 0;
      let weekCompanyShare = 0;
      const dayDetails = [];

      Object.entries(week.schedule).forEach(([day, schedule]) => {
        if (schedule.selected) {
          totalSessions++;
          const duration = parseFloat(schedule.duration);
          const shares = calculateShares(duration);
          weeklyTotal += shares.totalRate;
          weekTeacherShare += shares.teacherShare;
          weekCompanyShare += shares.companyShare;
          dayDetails.push({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            duration: schedule.duration === '0.5' ? '30 mins' : 
                      schedule.duration === '1' ? '1 hour' : 
                      schedule.duration === '1.5' ? '1.5 hours' :
                      schedule.duration === '2' ? '2 hours' :
                      `${schedule.duration} hours`,
            time: formatTime(schedule.time),
            totalRate: shares.totalRate,
            teacherShare: shares.teacherShare,
            companyShare: shares.companyShare
          });
        }
      });

      if (dayDetails.length > 0) {
        grandTotal += weeklyTotal;
        totalTeacherShare += weekTeacherShare;
        totalCompanyShare += weekCompanyShare;
        weekDetails.push({
          weekIndex,
          weekStart: week.weekStartDate,
          weekEnd: week.weekEndDate,
          weeklyTotal,
          weekTeacherShare,
          weekCompanyShare,
          days: dayDetails
        });
      }
    });

    return { 
      totalSessions, 
      grandTotal, 
      totalTeacherShare, 
      totalCompanyShare, 
      weekDetails 
    };
  };

  const summary = selectedTeacher ? calculateBookingSummary() : { 
    totalSessions: 0, 
    grandTotal: 0, 
    totalTeacherShare: 0, 
    totalCompanyShare: 0, 
    weekDetails: [] 
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    // Validate that at least one week has at least one day selected
    const hasSelectedDays = bookingData.weeks.some(week => 
      Object.values(week.schedule).some(s => s.selected)
    );
    
    if (!hasSelectedDays) {
      toast.error('Please select at least one day for sessions.');
      return;
    }

    // Validate required fields
    if (!bookingData.studentName || !bookingData.studentGrade || !bookingData.parentName) {
      toast.error('Please fill in all required fields (Student Name, Grade Level, Parent Name)');
      return;
    }

    try {
      const getRateForDuration = (duration) => {
        const rates = {
          0.5: 63,   // 30 mins
          1: 125,    // 1 hour
          1.5: 188,  // 1.5 hours
          2: 250     // 2 hours
        };
        return rates[duration] || 125;
      };

      // Create bookings for each week
      const bookingPromises = [];
      
      bookingData.weeks.forEach(week => {
        // Build weekly schedule object for this week
        const weeklySchedule = {};
        let totalEarnings = 0;
        let hasScheduledDays = false;

        Object.entries(week.schedule).forEach(([day, data]) => {
          const duration = parseFloat(data.duration) || 1;
          weeklySchedule[day] = {
            isScheduled: data.selected,
            duration: duration,
            rate: getRateForDuration(duration)
          };
          
          if (data.selected) {
            hasScheduledDays = true;
            totalEarnings += getRateForDuration(duration);
          }
        });

        // Only create booking if this week has at least one scheduled day
        if (hasScheduledDays) {
          const bookingPayload = {
            teacherId: selectedTeacher._id,
            parentFbName: bookingData.parentName,
            studentName: bookingData.studentName,
            gradeLevel: bookingData.studentGrade,
            subjectFocus: bookingData.subjectFocus || selectedTeacher.majorSubject || selectedTeacher.subject,
            contactNumber: bookingData.parentPhone,
            facebookProfileLink: bookingData.parentFacebook,
            additionalNote: bookingData.additionalNotes,
            weeklySchedule: weeklySchedule,
            totalEarningsPerWeek: totalEarnings,
            weekStartDate: week.weekStartDate.toISOString()
          };

          bookingPromises.push(bookingService.createBooking(bookingPayload));
        }
      });

      // Create all bookings
      await Promise.all(bookingPromises);

      const weekText = bookingPromises.length === 1 ? '1 week' : `${bookingPromises.length} weeks`;
      toast.success(`Successfully created bookings for ${weekText}! Student has been added to the system.`);
      
      setShowBookingForm(false);
      setSelectedTeacher(null);
      setAutoEncodeText('');

      // Refresh teachers to update booking counts
      await fetchTeachers();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
    }
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
                        <td>{teacher.majorSubject || teacher.subject}</td>
                        <td>{teacher.contactNumber || teacher.phone}</td>
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
                        <i className="fas fa-book"></i> {selectedTeacher.majorSubject || selectedTeacher.subject} Teacher
                      </p>
                      <div className="teacher-banner-meta">
                        <span><i className="fas fa-envelope"></i> {selectedTeacher.email}</span>
                        <span><i className="fas fa-phone"></i> {selectedTeacher.contactNumber || selectedTeacher.phone}</span>
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

                    {/* Weekly Schedules - Multiple Weeks */}
                    <div className="form-group full-width">
                      <div className="schedule-header">
                        <label className="schedule-label">
                          <i className="fas fa-calendar-week icon-label"></i> Weekly Schedules *
                        </label>
                        <button 
                          type="button" 
                          className="btn-add-week"
                          onClick={addWeek}
                        >
                          <i className="fas fa-plus"></i> Add Next Week
                        </button>
                      </div>
                      <p className="form-help">Each week is a separate booking. Click "Add Next Week" to schedule additional weeks.</p>
                      
                      {bookingData.weeks.map((week, weekIndex) => (
                        <div key={week.id} className="week-block">
                          <div className="week-block-header">
                            <h4>
                              <i className="fas fa-calendar-alt"></i> 
                              Week {weekIndex + 1}: {week.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {week.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h4>
                            {bookingData.weeks.length > 1 && (
                              <button
                                type="button"
                                className="btn-remove-week"
                                onClick={() => removeWeek(weekIndex)}
                                title="Remove this week"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          
                          <div className="weekly-schedule">
                            {Object.entries(week.schedule).map(([day, schedule]) => (
                              <div key={day} className={`day-schedule ${schedule.selected ? 'selected' : ''}`}>
                                <div className="day-header">
                                  <label className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={schedule.selected}
                                      onChange={() => handleDayToggle(weekIndex, day)}
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
                                        onChange={(e) => handleScheduleChange(weekIndex, day, 'time', e.target.value)}
                                      />
                                    </div>
                                    <div className="detail-field">
                                      <label>Duration</label>
                                      <select
                                        value={schedule.duration}
                                        onChange={(e) => handleScheduleChange(weekIndex, day, 'duration', e.target.value)}
                                      >
                                        <option value="0.5">30 mins</option>
                                        <option value="1">1 hour</option>
                                        <option value="1.5">1.5 hours</option>
                                        <option value="2">2 hours</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
                      <span className="summary-label">Total Weeks</span>
                      <span className="summary-value">{bookingData.weeks.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Sessions</span>
                      <span className="summary-value">{summary.totalSessions}</span>
                    </div>
                  </div>

                  {summary.weekDetails.length > 0 ? (
                    summary.weekDetails.map((weekDetail, weekIdx) => (
                      <div key={weekIdx} className="summary-section">
                        <h4 className="summary-subtitle">
                          <i className="fas fa-calendar-alt"></i> Week {weekDetail.weekIndex + 1}
                        </h4>
                        <div className="week-date-range">
                          {weekDetail.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDetail.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        {weekDetail.days.map((day, idx) => (
                          <div key={idx} className="rate-detail">
                            <div className="rate-day">{day.day}</div>
                            <div className="rate-info">
                              {day.time} • {day.duration}
                            </div>
                            <div className="rate-breakdown">
                              <div className="rate-amount">₱{day.totalRate.toFixed(2)}</div>
                              <div className="rate-shares">
                                <span className="share-teacher">Teacher: ₱{day.teacherShare.toFixed(2)}</span>
                                <span className="share-company">Company: ₱{day.companyShare.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="week-total">
                          <div className="rate-day">Week Total</div>
                          <div className="rate-breakdown">
                            <div className="rate-amount">₱{weekDetail.weeklyTotal.toFixed(2)}</div>
                            <div className="rate-shares">
                              <span className="share-teacher">Teacher: ₱{weekDetail.weekTeacherShare.toFixed(2)}</span>
                              <span className="share-company">Company: ₱{weekDetail.weekCompanyShare.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small">No days selected yet</p>
                  )}

                  {summary.weekDetails.length > 1 && (
                    <div className="summary-total">
                      <h4 className="summary-subtitle">Grand Total ({bookingData.weeks.length} weeks)</h4>
                      <div className="rate-detail">
                        <div className="rate-day">All Weeks</div>
                        <div className="rate-breakdown">
                          <div className="rate-amount grand-total">₱{summary.grandTotal.toFixed(2)}</div>
                          <div className="rate-shares">
                            <span className="share-teacher">Teacher: ₱{summary.totalTeacherShare.toFixed(2)}</span>
                            <span className="share-company">Company: ₱{summary.totalCompanyShare.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
