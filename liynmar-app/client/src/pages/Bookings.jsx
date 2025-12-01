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
    parentEmail: '',
    subject: '',
    date: '',
    time: '',
    duration: '1',
    days: [],
    notes: '',
  });

  // Sample teachers data
  const allTeachers = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      subject: 'Mathematics',
      email: 'sarah.johnson@liynmar.com',
      phone: '+63 912 345 6789',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      timeSlots: ['2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'],
      usualTime: '2:00 PM - 8:00 PM',
      rating: 4.9,
      hourlyRate: 125,
    },
    {
      _id: '2',
      name: 'Michael Chen',
      subject: 'Physics',
      email: 'michael.chen@liynmar.com',
      phone: '+63 912 345 6790',
      daysAvailable: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'],
      usualTime: '3:00 PM - 7:00 PM',
      rating: 4.8,
      hourlyRate: 125,
    },
    {
      _id: '3',
      name: 'Emily Santos',
      subject: 'English',
      email: 'emily.santos@liynmar.com',
      phone: '+63 912 345 6791',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'],
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
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM'],
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
      daysAvailable: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      timeSlots: ['2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'],
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
      teacher.usualTime.toLowerCase().includes(query) ||
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
      days: bookingData.days.includes(day)
        ? bookingData.days.filter((d) => d !== day)
        : [...bookingData.days, day],
    });
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    // Here you would send the booking data to your backend
    console.log('Booking submitted:', {
      teacher: selectedTeacher,
      booking: bookingData,
    });
    alert('Booking submitted successfully! (This will connect to backend later)');
    setShowBookingForm(false);
    setSelectedTeacher(null);
    setBookingData({
      studentName: '',
      studentGrade: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      subject: '',
      date: '',
      time: '',
      duration: '1',
      days: [],
      notes: '',
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
              <h3 className="card-title">Available Teachers</h3>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Subject</th>
                    <th>Available Days</th>
                    <th>Time Slots</th>
                    <th>Rate/Hour</th>
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
                        <td>
                          <div className="days-list">
                            {teacher.daysAvailable.map((day, idx) => (
                              <span key={idx} className="day-tag">
                                {day}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="time-slots">{teacher.usualTime}</td>
                        <td className="rate-cell">₱{teacher.hourlyRate}</td>
                        <td>
                          <button
                            className="btn-book"
                            onClick={() => handleBookTeacher(teacher)}
                          >
                            <i className="fas fa-calendar-plus"></i> Book Now
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        <i className="fas fa-search"></i>
                        <p>No teachers found.</p>
                        <p className="text-muted">Try adjusting your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Booking Form */
        <div className="booking-form-container">
          <div className="page-header">
            <div>
              <button className="btn-back" onClick={handleCancelBooking}>
                <i className="fas fa-arrow-left"></i> Back to Search
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Create New Booking</h3>
            </div>
            <div className="card-body">
              {/* Teacher Info Summary */}
              <div className="teacher-summary">
                <div className="teacher-summary-avatar">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.name)}&background=8B7355&color=fff`}
                    alt={selectedTeacher.name}
                  />
                </div>
                <div className="teacher-summary-content">
                  <div className="teacher-summary-header">
                    <div>
                      <h4>{selectedTeacher.name}</h4>
                      <p className="subject-badge">{selectedTeacher.subject}</p>
                    </div>
                    <div className="rate-badge">₱{selectedTeacher.hourlyRate}/hr</div>
                  </div>
                  <div className="teacher-summary-details">
                    <div className="detail-item">
                      <i className="fas fa-calendar-week"></i>
                      <span>{selectedTeacher.daysAvailable.join(', ')}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{selectedTeacher.usualTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmitBooking} className="booking-form">
                <div className="form-section">
                  <h4 className="form-section-title">
                    <i className="fas fa-user-graduate"></i> Student Information
                  </h4>
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
                        placeholder="Enter student's full name"
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
                        <option value="College">College</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">
                    <i className="fas fa-users"></i> Parent/Guardian Information
                  </h4>
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
                        placeholder="Enter parent's full name"
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
                      <label htmlFor="parentEmail">Email Address *</label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        value={bookingData.parentEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="parent@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">
                    <i className="fas fa-calendar-alt"></i> Session Details
                  </h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={bookingData.subject}
                        onChange={handleInputChange}
                        required
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Start Date *</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="time">Preferred Time *</label>
                      <select
                        id="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time slot</option>
                        {selectedTeacher.timeSlots.map((slot, idx) => (
                          <option key={idx} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="duration">Session Duration *</label>
                      <select
                        id="duration"
                        name="duration"
                        value={bookingData.duration}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="0.5">30 minutes</option>
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Select Days for Sessions *</label>
                    <div className="days-selector">
                      {selectedTeacher.daysAvailable.map((day) => (
                        <label key={day} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={bookingData.days.includes(day)}
                            onChange={() => handleDayToggle(day)}
                          />
                          <span className="day-label">{day}</span>
                        </label>
                      ))}
                    </div>
                    {bookingData.days.length > 0 && (
                      <p className="selected-days-text">
                        Selected: {bookingData.days.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Any special requirements or notes about the session..."
                    ></textarea>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="booking-summary">
                  <h4>Booking Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <label>Total Sessions per Week:</label>
                      <span>{bookingData.days.length} sessions</span>
                    </div>
                    <div className="summary-item">
                      <label>Rate per Session:</label>
                      <span>₱{selectedTeacher.hourlyRate * parseFloat(bookingData.duration || 1)}</span>
                    </div>
                    <div className="summary-item">
                      <label>Weekly Total:</label>
                      <span className="total-amount">
                        ₱{selectedTeacher.hourlyRate * parseFloat(bookingData.duration || 1) * bookingData.days.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={handleCancelBooking}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-check"></i> Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
