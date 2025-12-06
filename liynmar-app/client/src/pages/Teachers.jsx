import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLastBookingDate, calculateInactiveDuration } from '../utils/helpers';
import './Teachers.css';

const Teachers = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive', 'least-booked', 'most-booked', 'deleted'
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    phone: '',
    email: '',
    facebook: '',
    status: 'active',
    jobExperience: [{
      jobTitle: '',
      companyName: '',
      employmentType: 'Full Time',
      startDate: '',
      endDate: '',
      jobLocation: ''
    }]
  });

  // Load teachers from localStorage
  const loadTeachers = () => {
    const stored = localStorage.getItem('allTeachers');
    return stored ? JSON.parse(stored) : [];
  };

  // Load deleted teachers from localStorage
  const loadDeletedTeachers = () => {
    const stored = localStorage.getItem('deletedTeachers');
    return stored ? JSON.parse(stored) : [];
  };

  const [teachersData, setTeachersData] = useState(loadTeachers());
  const [deletedTeachers, setDeletedTeachers] = useState(loadDeletedTeachers());

  // Calculate booking count from localStorage
  const getBookingCount = (teacherId) => {
    const bookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
    return bookings[teacherId] ? bookings[teacherId].length : 0;
  };

  // Add booking counts to teachers
  const teachersWithBookings = teachersData.map(teacher => {
    const lastBookingDate = getLastBookingDate(teacher._id);
    const inactiveInfo = calculateInactiveDuration(lastBookingDate);
    
    return {
      ...teacher,
      totalBookings: getBookingCount(teacher._id),
      lastBookingDate,
      inactiveDuration: inactiveInfo.duration,
      autoInactive: inactiveInfo.isInactive,
      // Update status if auto-inactive
      status: inactiveInfo.isInactive ? 'inactive' : teacher.status
    };
  });

  // Filter and sort teachers
  const getFilteredAndSortedTeachers = () => {
    let filtered;

    // Choose dataset and apply initial filter based on activeFilter
    switch (activeFilter) {
      case 'deleted':
        // Show deleted teachers
        filtered = deletedTeachers.map(teacher => ({
          ...teacher,
          totalBookings: getBookingCount(teacher._id),
          deletedAt: teacher.deletedAt
        }));
        break;
      case 'active':
        // Show only active status teachers
        filtered = teachersWithBookings.filter(t => !t.isDeleted && t.status === 'active');
        break;
      case 'inactive':
        // Show only inactive teachers (including auto-inactive)
        filtered = teachersWithBookings.filter(t => !t.isDeleted && (t.status === 'inactive' || t.autoInactive));
        break;
      case 'least-booked':
        // Show all active teachers sorted by least bookings
        filtered = [...teachersWithBookings.filter(t => !t.isDeleted)].sort((a, b) => a.totalBookings - b.totalBookings);
        break;
      case 'most-booked':
        // Show all active teachers sorted by most bookings
        filtered = [...teachersWithBookings.filter(t => !t.isDeleted)].sort((a, b) => b.totalBookings - a.totalBookings);
        break;
      case 'all':
      default:
        // Show all active (non-deleted) teachers
        filtered = teachersWithBookings.filter(t => !t.isDeleted);
        break;
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.phone.toLowerCase().includes(query) ||
        (teacher.status && teacher.status.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredTeachers = getFilteredAndSortedTeachers();

  const handleAddTeacher = (e) => {
    e.preventDefault();
    
    const teacher = {
      _id: Date.now().toString(),
      ...newTeacher,
      daysAvailable: [],
      usualTime: '',
      totalBookings: 0
    };

    const updatedTeachers = [...teachersData, teacher];
    setTeachersData(updatedTeachers);
    localStorage.setItem('allTeachers', JSON.stringify(updatedTeachers));

    setNewTeacher({
      name: '',
      subject: '',
      phone: '',
      email: '',
      facebook: '',
      status: 'active',
      jobExperience: [{
        jobTitle: '',
        companyName: '',
        employmentType: 'Full Time',
        startDate: '',
        endDate: '',
        jobLocation: ''
      }]
    });
    setShowAddForm(false);
    alert('Teacher added successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher({
      ...newTeacher,
      [name]: value
    });
  };

  const handleJobExperienceChange = (index, field, value) => {
    const updatedExperience = [...newTeacher.jobExperience];
    updatedExperience[index][field] = value;
    setNewTeacher({
      ...newTeacher,
      jobExperience: updatedExperience
    });
  };

  const addJobExperience = () => {
    setNewTeacher({
      ...newTeacher,
      jobExperience: [...newTeacher.jobExperience, {
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
    const updatedExperience = newTeacher.jobExperience.filter((_, i) => i !== index);
    setNewTeacher({
      ...newTeacher,
      jobExperience: updatedExperience
    });
  };

  const handleSoftDelete = (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    // Find the teacher to delete
    const teacherToDelete = teachersData.find(t => t._id === teacherId);
    if (!teacherToDelete) return;

    // Add deletion timestamp
    const deletedTeacher = {
      ...teacherToDelete,
      deletedAt: new Date().toISOString(),
      isDeleted: true
    };

    // Remove from active teachers
    const updatedTeachers = teachersData.filter(t => t._id !== teacherId);
    setTeachersData(updatedTeachers);
    localStorage.setItem('allTeachers', JSON.stringify(updatedTeachers));

    // Add to deleted teachers
    const updatedDeleted = [...deletedTeachers, deletedTeacher];
    setDeletedTeachers(updatedDeleted);
    localStorage.setItem('deletedTeachers', JSON.stringify(updatedDeleted));

    alert('Teacher moved to deleted items');
  };

  const handleRestore = (teacherId) => {
    if (!window.confirm('Are you sure you want to restore this teacher?')) {
      return;
    }

    // Find the teacher to restore
    const teacherToRestore = deletedTeachers.find(t => t._id === teacherId);
    if (!teacherToRestore) return;

    // Remove deletion fields
    const { deletedAt, isDeleted, ...restoredTeacher } = teacherToRestore;

    // Add back to active teachers
    const updatedTeachers = [...teachersData, restoredTeacher];
    setTeachersData(updatedTeachers);
    localStorage.setItem('allTeachers', JSON.stringify(updatedTeachers));

    // Remove from deleted teachers
    const updatedDeleted = deletedTeachers.filter(t => t._id !== teacherId);
    setDeletedTeachers(updatedDeleted);
    localStorage.setItem('deletedTeachers', JSON.stringify(updatedDeleted));

    alert('Teacher restored successfully');
  };

  const handlePermanentDelete = (teacherId) => {
    if (!window.confirm('Are you sure you want to permanently delete this teacher? This action cannot be undone!')) {
      return;
    }

    // Remove from deleted teachers permanently
    const updatedDeleted = deletedTeachers.filter(t => t._id !== teacherId);
    setDeletedTeachers(updatedDeleted);
    localStorage.setItem('deletedTeachers', JSON.stringify(updatedDeleted));

    // Also remove their bookings
    const bookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
    delete bookings[teacherId];
    localStorage.setItem('teacherBookings', JSON.stringify(bookings));

    alert('Teacher permanently deleted');
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Teachers Management</h2>
          <p className="page-subtitle">Manage and monitor all teaching staff</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <i className="fas fa-plus"></i> Add Teacher
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="teachers-tabs">
        <button 
          className={`tab-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <i className="fas fa-list"></i> All
        </button>
        <button 
          className={`tab-button ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          <i className="fas fa-users"></i> Active Teachers
          <span className="tab-count">{teachersData.filter(t => t.status === 'active').length}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveFilter('inactive')}
        >
          <i className="fas fa-user-slash"></i> Inactive Teachers
          <span className="tab-count">{teachersWithBookings.filter(t => t.status === 'inactive' || t.autoInactive).length}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'least-booked' ? 'active' : ''}`}
          onClick={() => setActiveFilter('least-booked')}
        >
          <i className="fas fa-arrow-down"></i> Least Booked
        </button>
        <button 
          className={`tab-button ${activeFilter === 'most-booked' ? 'active' : ''}`}
          onClick={() => setActiveFilter('most-booked')}
        >
          <i className="fas fa-arrow-up"></i> Most Booked
        </button>
        <button 
          className={`tab-button ${activeFilter === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('deleted')}
        >
          <i className="fas fa-trash-alt"></i> Deleted Teachers
          <span className="tab-count">{deletedTeachers.length}</span>
        </button>
      </div>

      {/* Add Teacher Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button className="btn-close" onClick={() => setShowAddForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddTeacher}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newTeacher.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Major Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={newTeacher.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={newTeacher.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={newTeacher.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Facebook Account</label>
                  <input
                    type="text"
                    name="facebook"
                    value={newTeacher.facebook}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={newTeacher.status}
                    onChange={handleInputChange}
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

                {newTeacher.jobExperience.map((exp, index) => (
                  <div key={index} className="experience-card">
                    <div className="experience-header">
                      <h5>Experience {index + 1}</h5>
                      {newTeacher.jobExperience.length > 1 && (
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
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Teachers List</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Major Subject</th>
                <th>Contact Number</th>
                <th>Email Address</th>
                <th>Total Bookings</th>
                <th>{activeFilter === 'deleted' ? 'Deleted Date' : 'Status'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="teacher-row">
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
                      <span className="booking-count">{teacher.totalBookings}</span>
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <span className="deleted-date">
                          {new Date(teacher.deletedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      ) : (
                        <>
                          <span className={`status-badge ${teacher.status}`}>
                            {teacher.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          {teacher.autoInactive && teacher.inactiveDuration && (
                            <div className="inactive-info">
                              <i className="fas fa-clock"></i>
                              <span>Inactive for {teacher.inactiveDuration}</span>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <>
                          <button
                            className="btn-icon restore-teacher"
                            title="Restore Teacher"
                            onClick={() => handleRestore(teacher._id)}
                          >
                            <i className="fas fa-undo"></i>
                          </button>
                          <button
                            className="btn-icon permanent-delete-teacher"
                            title="Permanently Delete"
                            onClick={() => handlePermanentDelete(teacher._id)}
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-icon view-teacher"
                            title="View Profile"
                            onClick={() => navigate(`/teachers/${teacher._id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon delete-teacher"
                            title="Delete Teacher"
                            onClick={() => handleSoftDelete(teacher._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
