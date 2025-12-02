import React, { useState } from 'react';
import './Bookings.css';

const Bookings = ({ searchQuery = '' }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const [bookingData, setBookingData] = useState({
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

  // Sample teachers data - showing only available/active teachers
  const allTeachers = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      subject: 'Mathematics',
      email: 'sarah.johnson@liynmar.com',
      phone: '+63 912 345 6789',
      status: 'active',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      usualTime: '2:00 PM - 8:00 PM',
      rating: 4.9,
      hourlyRate: 125,
    },
    {
      _id: '3',
      name: 'Emily Santos',
      subject: 'English',
      email: 'emily.santos@liynmar.com',
      phone: '+63 912 345 6791',
      status: 'active',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      usualTime: '1:00 PM - 6:00 PM',
      rating: 4.9,
      hourlyRate: 125,
    },
    {
      _id: '4',
      name: 'David Martinez',
      subject: 'Chemistry',
      email: 'david.martinez@liynmar.com',
      phone: '+63 912 345 6792',
      status: 'active',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      usualTime: '4:00 PM - 9:00 PM',
      rating: 4.7,
      hourlyRate: 125,
    },
    {
      _id: '5',
      name: 'Lisa Wong',
      subject: 'Biology',
      email: 'lisa.wong@liynmar.com',
      phone: '+63 912 345 6793',
      status: 'active',
      daysAvailable: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      usualTime: '2:00 PM - 7:00 PM',
      rating: 4.8,
      hourlyRate: 125,
    },
  ];

  // Filter teachers based on header search query
  const filteredTeachers = allTeachers.filter((teacher) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      teacher.phone.toLowerCase().includes(query) ||
      teacher.status.toLowerCase().includes(query) ||
      teacher.daysAvailable.some((day) => day.toLowerCase().includes(query))
    );
  });

  const handleBookTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setBookingData({
      ...bookingData,
      subject: teacher.subject,
    });
    setShowBookingForm(true);
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

  const calculateBookingSummary = () => {
    let totalSessions = 0;
    let weeklyTotal = 0;
    const rateDetails = [];

    Object.entries(bookingData.weeklySchedule).forEach(([day, schedule]) => {
      if (schedule.selected) {
        totalSessions++;
        const duration = parseFloat(schedule.duration);
        const rate = selectedTeacher.hourlyRate * duration;
        weeklyTotal += rate;
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
          time: schedule.time || 'Not set',
          rate: rate
        });
      }
    });

    return { totalSessions, weeklyTotal, rateDetails };
  };

  const summary = selectedTeacher ? calculateBookingSummary() : { totalSessions: 0, weeklyTotal: 0, rateDetails: [] };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    
    // Validate that at least one day is selected
    const hasSelectedDays = Object.values(bookingData.weeklySchedule).some(s => s.selected);
    if (!hasSelectedDays) {
      alert('Please select at least one day for sessions.');
      return;
    }

    // Here you would send the booking data to your backend
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
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-chalkboard-teacher"></i> Booking for {selectedTeacher.name}
                    </h3>
                    <span className="card-subtitle">{selectedTeacher.subject} Teacher</span>
                  </div>
                  <div className="card-body">
                    <div className="teacher-info-box">
                      <div className="info-item">
                        <i className="fas fa-phone"></i>
                        <span>{selectedTeacher.phone}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-envelope"></i>
                        <span>{selectedTeacher.email}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>₱{selectedTeacher.hourlyRate}/hour</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-user-graduate"></i> Student Information
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="studentName">Student Name *</label>
                        <input
                          type="text"
                          id="studentName"
                          name="studentName"
                          value={bookingData.studentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter student name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="studentGrade">Grade Level *</label>
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
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-user-friends"></i> Parent/Guardian Information
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="parentName">Parent/Guardian Name *</label>
                        <input
                          type="text"
                          id="parentName"
                          name="parentName"
                          value={bookingData.parentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter parent/guardian name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="parentPhone">Contact Number *</label>
                        <input
                          type="tel"
                          id="parentPhone"
                          name="parentPhone"
                          value={bookingData.parentPhone}
                          onChange={handleInputChange}
                          required
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="parentFacebook">Facebook Link</label>
                        <input
                          type="text"
                          id="parentFacebook"
                          name="parentFacebook"
                          value={bookingData.parentFacebook}
                          onChange={handleInputChange}
                          placeholder="facebook.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-calendar-alt"></i> Session Details
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="subject">Major Subject *</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={bookingData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Algebra, Grammar"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="startDate">Start Date *</label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="form-group full-width">
                      <label>Select Days for Sessions *</label>
                      <p className="form-help">Different times and durations can be set for each day</p>
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
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="additionalNotes">Additional Notes</label>
                      <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={bookingData.additionalNotes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={handleCancelBooking}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-check"></i> Confirm Booking
                  </button>
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
                    <h4 className="summary-subtitle">Rates Applied This Week</h4>
                    {summary.rateDetails.length > 0 ? (
                      summary.rateDetails.map((detail, idx) => (
                        <div key={idx} className="rate-detail">
                          <div className="rate-day">{detail.day}</div>
                          <div className="rate-info">
                            {detail.time} • {detail.duration}
                          </div>
                          <div className="rate-amount">₱{detail.rate.toFixed(2)}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small">No days selected yet</p>
                    )}
                  </div>

                  <div className="summary-total">
                    <span className="total-label">Weekly Total</span>
                    <span className="total-amount">₱{summary.weeklyTotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-note">
                    <i className="fas fa-info-circle"></i>
                    <span>Rates are calculated based on hourly rate of ₱{selectedTeacher.hourlyRate}</span>
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
